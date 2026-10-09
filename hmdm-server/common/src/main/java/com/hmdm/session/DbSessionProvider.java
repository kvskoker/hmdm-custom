package com.hmdm.session;

import com.hmdm.persistence.SessionDAO;
import com.hmdm.persistence.domain.Session;
import com.hmdm.util.CryptoUtil;
import jakarta.inject.Inject;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

// Provider class for DBSession, to be injected in all classes using IHmdmSession
public class DbSessionProvider implements IHmdmSessionProvider {
    private final static Map<String, DbSession> sessions = new ConcurrentHashMap<>();
    public static final String COOKIE_NAME = "hsid";
    static final long SYNC_INTERVAL_MS = 10 * 1000;
    static final long STALE_SESSION_AGE_MS = 86400 * 1000;
    private static final int ID_LENGTH = 16;

    SessionDAO sessionDAO;

    @Inject
    public DbSessionProvider(SessionDAO sessionDAO) {
        this.sessionDAO = sessionDAO;
    }

    @Override
    public IHmdmSession getSession(HttpServletRequest request) {
        String sessionId = getSessionId(request);
        if (sessionId != null) {
            DbSession session = sessions.get(sessionId);
            if (session != null && session.validate()) {
                return session;
            }
            Session dbSession = sessionDAO.query(sessionId);
            if (dbSession != null) {
                session = new DbSession(this, dbSession);
                sessions.put(sessionId, session);
                return session;
            }
        }
        return null;
    }

    @Override
    public IHmdmSession getOrCreateSession(HttpServletRequest request,
                                           HttpServletResponse response,
                                           boolean forceNew) {
        String sessionId = getSessionId(request);
        if (sessionId == null || forceNew) {
            sessionId = CryptoUtil.randomString(ID_LENGTH);
        }
        if (getSessionId(request) == null || forceNew) {
            Cookie cookie = new Cookie(COOKIE_NAME, sessionId);
            cookie.setPath("/");
            response.addCookie(cookie);
        }
        final String sessionIdFinal = sessionId;
        return sessions.computeIfAbsent(sessionId, newSid -> {
            DbSession session = null;
            Session dbSession = sessionDAO.query(sessionIdFinal);
            if (dbSession != null) {
                return new DbSession(this, dbSession);
            } else {
                return new DbSession(this, newSid);
            }
        });
    }

    @Override
    public void invalidateSession(HttpServletRequest request, HttpServletResponse response) {
        Cookie cookie = new Cookie(COOKIE_NAME, "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    @Override
    public void collectGarbage() {
        long now = System.currentTimeMillis();
        sessionDAO.collectGarbage(now - DbSessionProvider.STALE_SESSION_AGE_MS);
    }

    public IHmdmSession getSession(String sessionId) {
        Session dbSession = sessionDAO.query(sessionId);
        if (dbSession != null) {
            return new DbSession(this, dbSession);
        } else {
            return null;
        }
    }

    // Remove the invalid session after validation
    void removeSession(String sessionId) {
        sessions.remove(sessionId);
    }

    // Helper method: get session ID from request cookies
    private String getSessionId(HttpServletRequest req) {
        if (req.getCookies() == null) {
            return null;
        }

        for (Cookie c : req.getCookies()) {
            if (COOKIE_NAME.equals(c.getName())) {
                return c.getValue();
            }
        }

        return null;
    }

}
