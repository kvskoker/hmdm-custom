package com.hmdm.session;

import com.hmdm.persistence.domain.Session;
import com.hmdm.persistence.domain.User;
import com.hmdm.rest.filter.AuthFilter;
import jakarta.servlet.http.HttpSession;

// Session implementation using DB and working across multiple WAR files
public class DbSession implements IHmdmSession {
    DbSessionProvider sessionProvider;
    Session dbSession;
    long lastSync;

    // Called when there's no session in the database, creates a new one
    DbSession(DbSessionProvider sessionProvider, String sessionId) {
        this.sessionProvider = sessionProvider;
        dbSession = new Session();
        dbSession.setSessionId(sessionId);
        lastSync = System.currentTimeMillis();
        dbSession.setCreated(lastSync);
        dbSession.setAccessed(lastSync);
        sessionProvider.sessionDAO.insert(dbSession);
    }

    // Called when there's a session in the database
    DbSession(DbSessionProvider sessionProvider, Session dbSession) {
        this.sessionProvider = sessionProvider;
        this.dbSession = dbSession;
        lastSync = System.currentTimeMillis();
        dbSession.setAccessed(lastSync);
    }

    boolean validate() {
        long now = System.currentTimeMillis();
        // Use cached data, query database only each 10 sec
        if (lastSync < now - DbSessionProvider.SYNC_INTERVAL_MS) {
            String sessionId = dbSession.getSessionId();
            dbSession = sessionProvider.sessionDAO.query(sessionId);
            if (dbSession == null) {
                sessionProvider.removeSession(sessionId);
                return false;
            }
            lastSync = now;
            // Update the accessed time
            sessionProvider.sessionDAO.update(dbSession);
        }
        return true;
    }

    @Override
    public User getUser() {
        dbSession.setAccessed(System.currentTimeMillis());
        if (!validate()) {
            return null;
        }
        return dbSession.getUser();
    }

    @Override
    public void setUser(User user) {
        if (dbSession == null) {
            // We should never be here - shouldn't manage an invalidated session
            return;
        }
        dbSession.setAccessed(System.currentTimeMillis());
        dbSession.setUser(user);
        lastSync = System.currentTimeMillis();
        sessionProvider.sessionDAO.update(dbSession);
    }

    @Override
    public boolean isTwoFactorNeeded() {
        dbSession.setAccessed(System.currentTimeMillis());
        if (!validate()) {
            return false;
        }
        return dbSession.isTwoFactorNeeded();
    }

    @Override
    public void setTwoFactorNeeded(boolean twoFactorNeeded) {
        if (dbSession == null) {
            // We should never be here - shouldn't manage an invalidated session
            return;
        }
        dbSession.setAccessed(System.currentTimeMillis());
        dbSession.setTwoFactorNeeded(twoFactorNeeded);
        lastSync = System.currentTimeMillis();
        sessionProvider.sessionDAO.update(dbSession);
    }

    @Override
    public void invalidate() {
        if (dbSession == null) {
            // We should never be here - shouldn't invalidate an already invalidated session
            return;
        }
        String sessionId = dbSession.getSessionId();
        sessionProvider.sessionDAO.delete(sessionId);
        sessionProvider.removeSession(sessionId);
    }

}
