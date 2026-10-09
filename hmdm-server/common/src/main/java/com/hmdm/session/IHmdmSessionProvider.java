package com.hmdm.session;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface IHmdmSessionProvider {
    IHmdmSession getSession(HttpServletRequest req);

    IHmdmSession getOrCreateSession(HttpServletRequest request,
                                    HttpServletResponse response,
                                    boolean forceNew);

    void invalidateSession(HttpServletRequest request,
                           HttpServletResponse response);

    void collectGarbage();
}
