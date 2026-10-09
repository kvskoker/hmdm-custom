package com.hmdm.auth;

import com.hmdm.persistence.domain.User;

public interface IHmdmAuth {
    User findUser(String login);
    boolean authenticate(User user, String password);
}
