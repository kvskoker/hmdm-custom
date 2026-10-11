package com.hmdm.rest.resource;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hmdm.persistence.DeviceDAO;
import com.hmdm.persistence.DeviceRegisterDAO;
import com.hmdm.persistence.domain.*;
import com.hmdm.persistence.mapper.DeviceRegisterMapper;
import com.hmdm.security.SecurityContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.util.CellRangeAddress;
import java.io.*;
import java.time.Instant;
import java.util.*;

@Path("/private/device-register")
@Produces("application/json")
public class DeviceRegisterResource {
    private final DeviceDAO devices;
    private final DeviceRegisterMapper mapper;
    private final DeviceRegisterDAO writer;
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final List<String> DEFAULT_FIELDS = List.of("Owner name", "Organization", "District", "Chiefdom", "Facility");
    private static final List<String> FIXED = List.of("Device number", "IMEI", "Phone", "Status", "Last seen (UTC)", "Configuration", "Serial", "Description");
    private static final int MAX_ROWS = 2000;

    @Inject public DeviceRegisterResource(DeviceDAO devices, DeviceRegisterMapper mapper, DeviceRegisterDAO writer) {
        this.devices = devices; this.mapper = mapper; this.writer = writer;
    }
    private User user() { return SecurityContext.get().getCurrentUser().orElseThrow(() -> new NotAuthorizedException("Sign in required")); }
    private void permission(String name) { user(); if (!SecurityContext.get().hasPermission(name)) throw new ForbiddenException(); }
    private Object ok(Object value) { return com.hmdm.rest.json.Response.OK(value); }
    private static BadRequestException bad(String message) {
        return new BadRequestException(Response.status(400).type("application/json")
                .entity(Map.of("message", message)).build());
    }
    public static class Settings {
        public List<String> fields = new ArrayList<>(DEFAULT_FIELDS);
        public int inactiveDays = 30;
    }
    public static class Update {
        public String number;
        public Map<String, String> values;
    }
    public static class Batch {
        public List<String> fields;
        public List<Update> rows;
    }
    private Settings settings() throws IOException {
        Map<String, Object> stored = mapper.settings(user().getCustomerId());
        Settings s = new Settings();
        if (stored != null) {
            s.fields = JSON.readValue((String) stored.get("fields"), new TypeReference<List<String>>() {});
            s.inactiveDays = ((Number) stored.get("days")).intValue();
        }
        return s;
    }
    @GET @Path("/settings") public Object getSettings() throws IOException { return ok(settings()); }
    @POST @Path("/settings") @Consumes("application/json")
    public Object saveSettings(Settings s) throws IOException {
        permission("settings");
        if (s == null || s.fields == null || s.fields.size() > 30 || s.inactiveDays < 1 || s.inactiveDays > 3650)
            throw bad("Use up to 30 fields and an inactivity threshold of 1-3650 days.");
        Set<String> seen = new HashSet<>();
        for (String name : s.fields) {
            if (name == null || !name.matches("[\\p{L}][\\p{L}\\p{N} _-]{0,59}") || !name.equals(name.trim()) ||
                    !seen.add(name.toLowerCase(Locale.ROOT)) || FIXED.stream().anyMatch(h -> h.equalsIgnoreCase(name)))
                throw bad("Field names must be unique, 1-60 characters, and not reserved export headings.");
        }
        mapper.settingsSave(user().getCustomerId(), JSON.writeValueAsString(s.fields), s.inactiveDays);
        return ok(s);
    }
    private Map<Integer, Map<String, String>> values(List<Device> visible) throws IOException {
        Map<Integer, Map<String, String>> result = new HashMap<>();
        if (!visible.isEmpty()) {
            for (Map<String, Object> stored : mapper.values(visible.stream().map(Device::getId).toList())) {
                result.put(((Number)stored.get("id")).intValue(), JSON.readValue((String)stored.get("data"),
                        new TypeReference<Map<String, String>>() {}));
            }
        }
        return result;
    }
    private Map<String, Object> row(Device d, List<String> fields, Map<Integer, Map<String, String>> stored) throws IOException {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("number", d.getNumber()); result.put("imei", d.getImei()); result.put("phone", d.getPhone());
        result.put("lastUpdate", d.getLastUpdate()); result.put("status", d.getStatusCode());
        result.put("configuration", d.getConfigName()); result.put("serial", d.getSerial()); result.put("description", d.getDescription());
        // Device-reported identifiers are used if no administrator override exists.
        if (d.getInfo() != null) {
            try {
                var info = JSON.readTree(d.getInfo());
                for (String key : List.of("imei", "phone", "serial"))
                    if (result.get(key) == null || result.get(key).toString().isEmpty()) result.put(key, info.path(key).asText(""));
            } catch (IOException ignored) { }
        }
        Map<String, String> data = new LinkedHashMap<>(stored.getOrDefault(d.getId(), Map.of()));
        data.keySet().retainAll(fields);
        result.put("values", data);
        return result;
    }
    private DeviceSearchRequest request(DeviceSearchRequest r) {
        user();
        if (r == null) r = new DeviceSearchRequest();
        r.setPageNum(Math.max(1, r.getPageNum()));
        r.setPageSize(Math.min(100, Math.max(1, r.getPageSize())));
        if (r.getSortDir() == null) r.setSortDir("ASC");
        return r;
    }
    @POST @Path("/search") @Consumes("application/json")
    public Object search(DeviceSearchRequest r) throws IOException {
        var found = devices.getAllDevices(request(r));
        List<Map<String, Object>> rows = new ArrayList<>();
        List<String> fields = settings().fields;
        var stored = values(found.getItems());
        for (Device d : found.getItems()) rows.add(row(d, fields, stored));
        return ok(Map.of("items", rows, "total", found.getTotalItemsCount()));
    }
    @POST @Path("/export") @Consumes("application/json")
    @Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public Response export(DeviceSearchRequest r) throws IOException {
        r = request(r); r.setPageNum(1); r.setPageSize(10001);
        var found = devices.getAllDevices(r);
        if (found.getTotalItemsCount() > 10000) throw bad("Limit the filters to 10000 devices per export.");
        Settings s = settings();
        var stored = values(found.getItems());
        try (XSSFWorkbook book = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = book.createSheet("Devices");
            List<String> headers = new ArrayList<>(FIXED); headers.addAll(s.fields);
            Row header = sheet.createRow(0);
            CellStyle bold = book.createCellStyle(); Font font = book.createFont(); font.setBold(true); bold.setFont(font);
            for (int i=0;i<headers.size();i++) { header.createCell(i).setCellValue(headers.get(i)); header.getCell(i).setCellStyle(bold); sheet.setColumnWidth(i, 24*256); }
            int index = 1;
            for (Device d : found.getItems()) {
                Map<String, Object> item = row(d, s.fields, stored);
                List<String> cells = new ArrayList<>();
                for (String key : List.of("number", "imei", "phone")) cells.add(Objects.toString(item.get(key), ""));
                cells.add(status(d.getStatusCode(), d.getLastUpdate()));
                cells.add(d.getLastUpdate() != null && d.getLastUpdate() > 0 ? Instant.ofEpochMilli(d.getLastUpdate()).toString() : "");
                for (String key : List.of("configuration", "serial", "description")) cells.add(Objects.toString(item.get(key), ""));
                Map<?, ?> data = (Map<?, ?>) item.get("values");
                for (String field : s.fields) cells.add(Objects.toString(data.get(field), ""));
                Row target = sheet.createRow(index++);
                // Explicit string cells preserve identifiers and never execute user values as formulas.
                for (int i=0;i<cells.size();i++) target.createCell(i, CellType.STRING).setCellValue(cells.get(i));
            }
            sheet.createFreezePane(1, 1);
            sheet.setAutoFilter(new CellRangeAddress(0, Math.max(0, index-1), 0, headers.size()-1));
            book.write(output);
            return Response.ok(output.toByteArray()).header("Content-Disposition", "attachment; filename=devices.xlsx")
                    .header("Cache-Control", "no-store").build();
        }
    }
    private String status(String color, Long last) {
        if (last == null || last <= 0) return "Never connected";
        return "red".equals(color) ? "Inactive" : "green".equals(color) ? "Recently connected" : "Within policy";
    }
    private void validate(Batch batch) throws IOException {
        permission("edit_devices");
        if (batch == null || batch.rows == null || batch.rows.isEmpty() || batch.rows.size() > MAX_ROWS)
            throw bad("Provide 1-2000 device rows.");
        if (!settings().fields.equals(batch.fields)) throw bad("Custom fields changed. Refresh and import again.");
        Set<String> numbers = new HashSet<>();
        for (int i=0;i<batch.rows.size();i++) {
            Update row = batch.rows.get(i);
            String error = "Row " + (i+2) + ": ";
            if (row == null || row.number == null || !numbers.add(row.number) || row.values == null || row.values.isEmpty())
                throw bad(error + "Missing/duplicate device number or empty update.");
            if (mapper.accessibleId(user().getCustomerId(), user().getId(), row.number) == null)
                throw bad(error + "Device not found or not accessible.");
            for (var entry : row.values.entrySet()) {
                if (!batch.fields.contains(entry.getKey()) || entry.getValue() == null || entry.getValue().length() > 500)
                    throw bad(error + "Unknown field or value longer than 500 characters.");
            }
        }
    }
    @POST @Path("/save") @Consumes("application/json")
    public Object save(Batch batch) throws IOException {
        validate(batch);
        writer.save(user().getCustomerId(), user().getId(), JSON.writeValueAsString(batch.rows), batch.rows.size());
        return ok(Map.of("updated", batch.rows.size()));
    }
    @POST @Path("/preview") @Consumes("application/octet-stream")
    public Object preview(InputStream input) throws IOException {
        permission("edit_devices");
        byte[] bytes = input.readNBytes(5*1024*1024+1);
        if (bytes.length > 5*1024*1024) throw bad("Workbook exceeds 5 MB.");
        // Bound decompression before POI materializes workbook XML in memory.
        try (var zip = new java.util.zip.ZipInputStream(new ByteArrayInputStream(bytes))) {
            byte[] buffer = new byte[8192]; long total = 0; int entries = 0;
            while (zip.getNextEntry() != null) {
                if (++entries > 1000) throw bad("Workbook has too many ZIP entries.");
                long size = 0; int n;
                while ((n = zip.read(buffer)) != -1) {
                    size += n; total += n;
                    if (size > 20*1024*1024 || total > 50*1024*1024) throw bad("Workbook expands beyond the import size limit.");
                }
            }
        }
        Batch batch = new Batch(); batch.fields = settings().fields; batch.rows = new ArrayList<>();
        try (XSSFWorkbook book = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            if (book.getNumberOfSheets() != 1) throw bad("Use one worksheet only.");
            Sheet sheet = book.getSheetAt(0);
            if (sheet.getLastRowNum() > MAX_ROWS) throw bad("Use at most 2000 rows per import.");
            Row header = sheet.getRow(0);
            if (header == null || header.getLastCellNum() > 38) throw bad("Invalid workbook headings.");
            Map<Integer, String> columns = new LinkedHashMap<>(); Set<String> seen = new HashSet<>(); int numberColumn = -1;
            for (int c=0;c<header.getLastCellNum();c++) {
                String name = text(header.getCell(c));
                if (name.isBlank() || !seen.add(name)) throw bad("Blank or duplicate heading.");
                if (name.equals("Device number")) numberColumn=c;
                else if (batch.fields.contains(name)) columns.put(c, name);
                else if (!FIXED.contains(name)) throw bad("Unknown heading: " + name);
            }
            if (numberColumn < 0 || columns.isEmpty()) throw bad("Include Device number and at least one configured custom field.");
            for (int r=1;r<=sheet.getLastRowNum();r++) {
                Row source = sheet.getRow(r); if (source == null) continue;
                boolean empty=true;
                for (Cell cell : source) {
                    if (!text(cell).isBlank()) {
                        empty=false;
                        if (cell.getColumnIndex() >= header.getLastCellNum()) throw bad("Row " + (r+1) + ": Value without a column heading.");
                    }
                }
                if (empty) continue;
                Cell number = source.getCell(numberColumn);
                if (number == null || number.getCellType() != CellType.STRING)
                    throw bad("Row " + (r+1) + ": Device number must be stored as text to preserve leading zeros.");
                Update row = new Update(); row.number=number.getStringCellValue(); row.values=new LinkedHashMap<>();
                for (var column : columns.entrySet()) row.values.put(column.getValue(), text(source.getCell(column.getKey())));
                batch.rows.add(row);
            }
        } catch (BadRequestException e) { throw e; }
        catch (Exception e) { throw bad("Cannot read workbook. Upload an unencrypted .xlsx file without formulas."); }
        validate(batch);
        return ok(batch);
    }
    private static String text(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) return "";
        if (cell.getCellType() == CellType.FORMULA || cell.getCellType() == CellType.ERROR)
            throw bad("Formulas and error cells are not accepted.");
        return new DataFormatter(Locale.ROOT).formatCellValue(cell);
    }
}
