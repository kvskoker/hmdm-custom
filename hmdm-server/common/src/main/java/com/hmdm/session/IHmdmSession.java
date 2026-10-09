package com.hmdm.session;

import com.hmdm.persistence.domain.User;
import jakarta.servlet.http.HttpServletRequest;

public interface IHmdmSession {
    User getUser();
    void setUser(User user);
    boolean isTwoFactorNeeded();
    void setTwoFactorNeeded(boolean twoFactorNeeded);
    void invalidate();
}
