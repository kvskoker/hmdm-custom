import com.hmdm.rest.resource.BrandResource;
import jakarta.servlet.ServletContext;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.StreamingOutput;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.lang.reflect.Proxy;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicBoolean;

public class BrandResourceSmokeTest {
    private static BrandResource resource(String logo) {
        return new BrandResource("Test", logo, "Vendor", "", "", "", "");
    }

    public static void main(String[] args) throws Exception {
        byte[] image = Files.readAllBytes(Path.of("/tmp/web/images/logo.png"));
        AtomicBoolean closed = new AtomicBoolean();
        ServletContext context = (ServletContext) Proxy.newProxyInstance(
                ServletContext.class.getClassLoader(), new Class<?>[]{ServletContext.class},
                (proxy, method, arguments) -> {
                    if (!method.getName().equals("getResourceAsStream") ||
                            !"/images/logo.png".equals(arguments[0])) {
                        throw new AssertionError("Unexpected ServletContext call");
                    }
                    return new ByteArrayInputStream(image) {
                        @Override public void close() { closed.set(true); }
                    };
                });
        for (String logo : new String[]{"", null}) {
            closed.set(false);
            try (Response response = resource(logo).getRebrandedLogo(context)) {
                if (response.getStatus() != 200 || response.getLocation() != null ||
                        !"image/png".equals(response.getMediaType().toString()) ||
                        !Arrays.equals(image, (byte[]) response.getEntity()) || !closed.get()) {
                    throw new AssertionError("Bundled logo must return PNG bytes without redirect and close its stream");
                }
            }
        }
        ServletContext missing = (ServletContext) Proxy.newProxyInstance(
                ServletContext.class.getClassLoader(), new Class<?>[]{ServletContext.class},
                (proxy, method, arguments) -> null);
        try (Response response = resource("").getRebrandedLogo(missing)) {
            if (response.getStatus() != 404) throw new AssertionError("Missing bundled logo");
        }
        Path custom = Files.createTempFile("brand-test-", ".png");
        try {
            Files.write(custom, image);
            try (Response response = resource(custom.toString()).getRebrandedLogo(context)) {
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                ((StreamingOutput) response.getEntity()).write(output);
                if (response.getStatus() != 200 || !Arrays.equals(image, output.toByteArray())) {
                    throw new AssertionError("Custom logo changed");
                }
            }
        } finally {
            Files.deleteIfExists(custom);
        }
        try (Response response = resource(custom.toString()).getRebrandedLogo(context)) {
            if (response.getStatus() != 404) throw new AssertionError("Missing custom logo");
        }
        System.out.println("PASS: bundled/null/custom/missing logos; no HTTP redirects; bundled stream closed");
    }
}
