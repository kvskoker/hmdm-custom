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

package com.hmdm.persistence.mapper;

import com.hmdm.persistence.domain.Icon;
import com.hmdm.persistence.domain.Session;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * <p>An ORM Mapper for {@link Session} domain object.</p>
 *
 * @author seva
 */
public interface SessionMapper {

    @Insert("INSERT INTO sessions (sessionId, created, accessed, userData, twoFactorNeeded) VALUES " +
            "(#{sessionId}, #{created}, #{accessed}, #{userData}, #{twoFactorNeeded})")
    void insert(Session session);

    @Update("UPDATE sessions SET created=#{created}, accessed=#{accessed}, userData=#{userData}, " +
            "twoFactorNeeded=#{twoFactorNeeded} WHERE sessionId=#{sessionId}")
    int update(Session session);

    @Select("SELECT * FROM sessions WHERE sessionId = #{sessionId}")
    Session query(@Param("sessionId") String sessionId);

    @Delete("DELETE FROM sessions WHERE sessionId = #{sessionId}")
    void delete(@Param("sessionId") String sessionId);

    @Delete("DELETE FROM sessions WHERE accessed < #{boundary}")
    void collectGarbage(@Param("boundary") long boundary);
}
