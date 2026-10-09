package com.hmdm.rest.resource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.name.Named;
import com.hmdm.persistence.UnsecureDAO;
import com.hmdm.persistence.domain.Alert;
import com.hmdm.persistence.domain.User;
import com.hmdm.session.DbSessionProvider;
import com.hmdm.session.IHmdmSession;
import com.hmdm.session.IHmdmSessionProvider;
import com.hmdm.session.NativeSessionProvider;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.http.HttpSession;
import jakarta.websocket.server.HandshakeRequest;
import jakarta.websocket.server.ServerEndpoint;
import jakarta.websocket.*;
import jakarta.websocket.server.ServerEndpointConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;

@ServerEndpoint(
        value = "/ws/alerts",
        configurator = AlertWebsocketEndpoint.Configurator.class
)
public class AlertWebsocketEndpoint {
    // A logging service
    private static final Logger logger = LoggerFactory.getLogger(AlertWebsocketEndpoint.class);

    private static final String HTTP_SESSION_ATTR = "httpSession";
    private static final String DB_SESSION_ATTR = "dbSession";

    private final IHmdmSessionProvider sessionProvider;
    private final UnsecureDAO unsecureDAO;

    private static final ConcurrentHashMap<Session, SessionData> sessionMap =
            new ConcurrentHashMap<>();

    private static final BlockingQueue<Alert> queue =
            new LinkedBlockingQueue<>();

    private static final ObjectMapper objectMapper =
            new ObjectMapper();

    private static volatile boolean running;
    private static Thread consumerThread;

    @Inject
    public AlertWebsocketEndpoint(@Named("session.class") IHmdmSessionProvider sessionProvider,
                                  UnsecureDAO unsecureDAO) {
        this.sessionProvider = sessionProvider;
        this.unsecureDAO = unsecureDAO;
    }

    @OnOpen
    public void onOpen(Session wsSession, EndpointConfig config) {
        HttpSession httpSession = (HttpSession)config.getUserProperties().get(HTTP_SESSION_ATTR);
        String dbSessionId = (String)config.getUserProperties().get(DB_SESSION_ATTR);
        IHmdmSession hmdmSession = null;
        logger.debug("Websocket client connected: " + wsSession.getId());

        if (sessionProvider instanceof NativeSessionProvider) {
            if (httpSession != null) {
                hmdmSession = ((NativeSessionProvider)sessionProvider).getSession(httpSession);
            }
        } else if (sessionProvider instanceof DbSessionProvider) {
            if (dbSessionId != null) {
                hmdmSession = ((DbSessionProvider)sessionProvider).getSession(dbSessionId);
            }
        } else {
            logger.error("Unsupported sessionProvider type: " + sessionProvider.getClass());
        }

        if (hmdmSession != null) {
            // Re-read user from the database to avoid cookie penetration
            User user = unsecureDAO.findById(hmdmSession.getUser().getId());
            SessionData sessionData = new SessionData(user, unsecureDAO);
            sessionMap.put(wsSession, sessionData);
        } else {
            try {
                logger.warn("Unauthorized access to websocket endpoint: " + wsSession.getId());
                wsSession.close(new CloseReason(
                        CloseReason.CloseCodes.VIOLATED_POLICY,
                        "Unauthorized"
                ));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    @OnClose
    public void onClose(Session session) {
        System.out.println("Disconnected: " + session.getId());
        sessionMap.remove(session);
    }

    @OnError
    public void onError(Session session, Throwable error) {
        error.printStackTrace();
        sessionMap.remove(session);
    }

    public static void start() {
        running = true;

        consumerThread = new Thread(() -> {
            while (running) {
                try {
                    Alert alert = queue.take();
                    broadcast(alert);

                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    running = false;

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }, "events-websocket-consumer");

        consumerThread.start();
    }

    public static void stop() {
        running = false;

        if (consumerThread != null) {
            consumerThread.interrupt();
        }

        sessionMap.clear();
        queue.clear();
    }

    public static void publish(Alert alert) {
        queue.offer(alert);
    }

    private static void broadcast(Alert alert) throws Exception {
        String json = objectMapper.writeValueAsString(alert);

        sessionMap.forEach((session, data) -> {
            if (data.user.getCustomerId() == alert.getCustomerId() &&
                    data.user.getAlertLevel() <= alert.getLevel() &&
                    (data.user.isAllDevicesAvailable() ||
                    (alert.getDeviceId() != null && data.unsecureDAO.userHasDeviceAccess(data.user.getId(), alert.getDeviceId())))) {
                if (session.isOpen()) {
                    session.getAsyncRemote().sendText(json);
                }
            }
        });
    }

    public static class AppInjectorProvider {

        private static Injector injector;

        public static void setInjector(Injector injector) {
            AppInjectorProvider.injector = injector;
        }

        public static Injector getInjector() {
            return injector;
        }
    }

    public static class Configurator
            extends ServerEndpointConfig.Configurator {

        @Override
        public <T> T getEndpointInstance(Class<T> endpointClass)
                throws InstantiationException {

            Injector injector = AppInjectorProvider.getInjector();

            return injector.getInstance(endpointClass);
        }

        @Override
        public void modifyHandshake(ServerEndpointConfig config,
                                    HandshakeRequest request,
                                    HandshakeResponse response) {

            HttpSession httpSession = (HttpSession) request.getHttpSession();
            if (httpSession != null) {
                config.getUserProperties().put(AlertWebsocketEndpoint.HTTP_SESSION_ATTR, httpSession);
            }
            List<String> cookieHeaders = request.getHeaders().get("Cookie");
            if (cookieHeaders != null) {
                for (String header : cookieHeaders) {
                    String[] cookies = header.split(";");

                    for (String cookie : cookies) {
                        String[] pair = cookie.trim().split("=", 2);

                        if (pair.length == 2 && DbSessionProvider.COOKIE_NAME.equals(pair[0])) {
                            config.getUserProperties().put(AlertWebsocketEndpoint.DB_SESSION_ATTR, pair[1]);
                        }
                    }
                }
            }
        }
    }

    private static class SessionData {
        public User user;
        public UnsecureDAO unsecureDAO;
        public SessionData() {}
        public SessionData(User user, UnsecureDAO unsecureDAO) {
            this.user = user;
            this.unsecureDAO = unsecureDAO;
        }
    }
}
