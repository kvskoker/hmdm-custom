package com.hmdm.util;

import java.io.*;
import java.util.Base64;

public class SerializationUtil {
    public static String serializeToString(Serializable obj) throws IOException {
        if (obj == null) {
            return null;
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ObjectOutputStream oos = new ObjectOutputStream(baos)) {

            oos.writeObject(obj);
            oos.flush();
            byte[] bytes = baos.toByteArray();

            return Base64.getEncoder().encodeToString(bytes);
        }
    }

    @SuppressWarnings("unchecked")
    public static <T> T deserializeFromString(String data, Class<T> type)
            throws IOException, ClassNotFoundException {

        if (data == null) {
            return null;
        }

        byte[] bytes = Base64.getDecoder().decode(data);

        try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
             ObjectInputStream ois = new ObjectInputStream(bais)) {

            Object obj = ois.readObject();
            return (T) obj;  // will throw ClassCastException if wrong type
        }
    }
}
