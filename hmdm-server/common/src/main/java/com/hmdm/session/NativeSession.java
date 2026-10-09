package com.hmdm.session;

import com.hmdm.persistence.domain.User;
import com.hmdm.rest.filter.AuthFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

// Wrapper around HttpSession working probably faster but in one WAR only
public class NativeSession implements IHmdmSession {
    HttpSession session;

    NativeSession(HttpSession session) {
        this.session = session;
    }

    @Override
    public User getUser() {
        if (session == null) {
            return null;
        }
        return (User) session.getAttribute(AuthFilter.sessionCredentials);
    }

    @Override
    public void setUser(User user) {
        if (session == null) {
            // Probably we have to report an error here!
            return;
        }
        if (user != null) {
            session.setAttribute(AuthFilter.sessionCredentials, user);
        } else {
            session.removeAttribute(AuthFilter.sessionCredentials);
        }
    }

    @Override
    public boolean isTwoFactorNeeded() {
        if (session == null) {
            return false;
        }
        return session.getAttribute(AuthFilter.twoFactorNeeded) != null;
    }

    @Override
    public void setTwoFactorNeeded(boolean twoFactorNeeded) {
        if (session == null) {
            // Probably we have to report an error here!
            return;
        }
        if (twoFactorNeeded) {
            session.setAttribute(AuthFilter.twoFactorNeeded, "true");
        } else {
            session.removeAttribute(AuthFilter.twoFactorNeeded);
        }
    }

    @Override
    public void invalidate() {
        if (session != null) {
            session.invalidate();
        }
    }
}
