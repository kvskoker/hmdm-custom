package com.hmdm.plugins.devicereset.util;

import java.security.SecureRandom;

/**
 * Generates lock-screen PINs.
 *
 * resetPasswordWithToken() fails if the new credential does not satisfy the active
 * password quality policy, so avoid values Android rejects outright: sequences
 * (123456), repeats (000000) and short lengths.
 */
public final class PinGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int DEFAULT_LENGTH = 6;

    private PinGenerator() {
    }

    public static String generate() {
        return generate(DEFAULT_LENGTH);
    }

    public static String generate(int length) {
        if (length < 4) {
            length = 4;
        }
        for (int attempt = 0; attempt < 50; attempt++) {
            StringBuilder sb = new StringBuilder(length);
            for (int i = 0; i < length; i++) {
                sb.append((char) ('0' + RANDOM.nextInt(10)));
            }
            String pin = sb.toString();
            if (!isWeak(pin)) {
                return pin;
            }
        }
        // Astronomically unlikely; a valid PIN still beats failing the request.
        return String.valueOf(100000 + RANDOM.nextInt(899999));
    }

    private static boolean isWeak(String pin) {
        boolean allSame = true;
        boolean ascending = true;
        boolean descending = true;
        for (int i = 1; i < pin.length(); i++) {
            int prev = pin.charAt(i - 1);
            int cur = pin.charAt(i);
            if (cur != prev) allSame = false;
            if (cur != prev + 1) ascending = false;
            if (cur != prev - 1) descending = false;
        }
        return allSame || ascending || descending;
    }
}
