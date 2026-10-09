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
import com.hmdm.persistence.domain.Alert;
import com.hmdm.persistence.domain.Customer;
import com.hmdm.persistence.mapper.AlertMapper;
import com.hmdm.rest.json.AlertFilter;
import com.hmdm.security.SecurityContext;
import org.mybatis.guice.transactional.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

/**
 * <p>A DAO for alert records.</p>
 *
 * @author isv
 */
@Singleton
public class AlertDAO extends AbstractDAO<Alert> {

    /**
     * <p>A logger to be used for logging the events.</p>
     */
    private static final Logger logger = LoggerFactory.getLogger(AlertDAO.class);

    private final AlertMapper alertMapper;
    private final UserDAO userDAO;
    private final UnsecureDAO unsecureDAO;

    /**
     * <p>Constructs new <code>PostgresDeviceLogDAO</code> instance. This implementation does nothing.</p>
     */
    @Inject
    public AlertDAO(AlertMapper alertMapper,
                    UserDAO userDAO,
                    UnsecureDAO unsecureDAO) {
        this.alertMapper = alertMapper;
        this.userDAO = userDAO;
        this.unsecureDAO = unsecureDAO;
    }

    /**
     * <p>Finds the alerts matching the specified filter.</p>
     *
     * @param filter a filter used to narrowing down the search results.
     * @return a list of alerts matching the specified filter.
     */
    @Transactional
    public List<Alert> findAll(AlertFilter filter) {
        prepareFilter(filter);

        final List<Alert> result = this.getListWithCurrentUser(currentUser -> {
            filter.setCustomerId(currentUser.getCustomerId());
            filter.setUserId(currentUser.getId());
            filter.setAdmin(userDAO.isOrgAdmin(currentUser) || currentUser.isSuperAdmin());
            return this.alertMapper.findAll(filter);
        });

        return new ArrayList<>(result);
    }

    /**
     * <p>Counts the log records matching the specified filter.</p>
     *
     * @param filter a filter used to narrowing down the search results.
     * @return a number of log records matching the specified filter.
     */
    public long countAll(AlertFilter filter) {
        prepareFilter(filter);
        return SecurityContext.get().getCurrentUser()
                .map(currentUser -> {
                    filter.setCustomerId(currentUser.getCustomerId());
                    filter.setUserId(currentUser.getId());
                    filter.setAdmin(userDAO.isOrgAdmin(currentUser) || currentUser.isSuperAdmin());
                    return this.alertMapper.countAll(filter);
                })
                .orElse(0L);
    }

    /**
     * <p>Inserts the alert into underlying persistent data store.</p>
     *
     * @param alert an alert to be inserted
     * @return an id of the alert inserted into underlying persistent store.
     */
    public int insertRecord(Alert alert) {
        return alertMapper.insertRecord(alert);
    }


    /**
     * <p>Deletes the alert records which are older than number of days configured in customer's profile.</p>
     */
    public void purgeRecords() {
        try {
            logger.info("Deleting outdated records from alerts table...");

            List<Customer> customers = unsecureDAO.getAllCustomersUnsecure();
            for (Customer c : customers) {
                final int count = this.alertMapper.purgeRecords(c.getId());
                if (count > 0) {
                    logger.info("Deleted {} records from the alerts table for customer {}", count, c.getId());
                }
            }

        } catch (Exception e) {
            logger.error("Unexpected error when purging the alerts table", e);
        }
    }


    /**
     * <p>Prepares the filter for usage by mapper.</p>
     *
     * @param filter a filter provided by request.
     */
    private static void prepareFilter(AlertFilter filter) {
        if (filter.getMessageFilter() != null) {
            if (filter.getMessageFilter().trim().isEmpty()) {
                filter.setMessageFilter(null);
            } else {
                filter.setMessageFilter('%' + filter.getMessageFilter().trim() + '%');
            }
        }
    }

}
