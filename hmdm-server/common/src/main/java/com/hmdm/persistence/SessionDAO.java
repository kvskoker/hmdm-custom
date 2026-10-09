/*
 *
 * Headwind MDM: Open Source Android MDM Software
 * https://h-mdm.com
 *
 * Copyright (C) 2019 Headwind Solutions LLC (http://h-sms.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package com.hmdm.persistence;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hmdm.persistence.domain.Icon;
import com.hmdm.persistence.domain.Session;
import com.hmdm.persistence.mapper.IconMapper;
import com.hmdm.persistence.mapper.SessionMapper;
import com.hmdm.security.SecurityException;

import java.util.List;

/**
 * <p>A DAO used for managing the session data.</p>
 *
 * @author seva
 */
@Singleton
public class SessionDAO {

    /**
     * <p>An interface to session data persistence layer.</p>
     */
    private final SessionMapper sessionMapper;

    /**
     * <p>Constructs new <code>SessionDAO</code> instance. This implementation does nothing.</p>
     */
    @Inject
    public SessionDAO(SessionMapper sessionMapper) {
        this.sessionMapper = sessionMapper;
    }

    /**
     * <p>Inserts new record for the specified session.</p>
     *
     * @param session a session to be inserted into DB (unique sessionId required).
     */
    public void insert(Session session) {
        sessionMapper.insert(session);
    }

    /**
     * <p>Updates a record for the specified session.</p>
     *
     * @param session a session to be updated (valid sessionId required).
     */
    public void update(Session session) {
        sessionMapper.update(session);
    }

    /**
     * <p>Retrieves a record for the specified sessionId.</p>
     *
     * @param sessionId an ID of the session to be deleted.
     */
    public Session query(String sessionId) {
        return sessionMapper.query(sessionId);
    }

    /**
     * <p>Deletes a record for the specified sessionId.</p>
     *
     * @param sessionId an ID of the session to be deleted.
     */
    public void delete(String sessionId) {
        sessionMapper.delete(sessionId);
    }

    /**
     * <p>Deletes records older than the specified date/tie.</p>
     *
     * @param boundary a date/time before which to delete sessions
     */
    public void collectGarbage(long boundary) {
        sessionMapper.collectGarbage(boundary);
    }

}
