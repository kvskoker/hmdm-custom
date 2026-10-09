package com.hmdm.session;

import com.hmdm.persistence.SessionDAO;
import jakarta.inject.Inject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

// Provider class for NativeSession, to be injected in all classes using IHmdmSession
public class NativeSessionProvider implements IHmdmSessionProvider {

    @Override
    public IHmdmSession getSession(HttpServletRequest request) {
        return new NativeSession(request.getSession(false));
    }

    public IHmdmSession getOrCreateSession(HttpServletRequest request,
                                           HttpServletResponse response,
                                           boolean forceNew) {
        return new NativeSession(request.getSession(true));
    }

    @Override
    public void invalidateSession(HttpServletRequest request, HttpServletResponse response) {
        // Nothing to do - session is invalidated by calling session.invalidate()
    }

    @Override
    public void collectGarbage() {
        // Nothing to do - garbage is collected by Tomcat
    }

    public IHmdmSession getSession(HttpSession session) {
        return new NativeSession(session);
    }
}
