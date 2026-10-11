import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.nio.file.*;
import java.io.*;

public class DeviceRegisterWorkbookFixtures {
    public static void main(String[] args) throws Exception {
        Path directory = Path.of(args[0]); Files.createDirectories(directory);
        if (args.length > 1 && args[1].equals("verify")) {
            try (XSSFWorkbook book = new XSSFWorkbook(Files.newInputStream(directory.resolve("export.xlsx")))) {
                Sheet sheet = book.getSheetAt(0);
                if (sheet.getLastRowNum() != 1) throw new AssertionError("Export must honor the filter");
                Row row = sheet.getRow(1);
                if (row.getCell(0).getCellType() != CellType.STRING || !row.getCell(0).getStringCellValue().equals("00001"))
                    throw new AssertionError("Leading zeros lost");
                if (!row.getCell(1).getStringCellValue().equals("012345678901234")) throw new AssertionError("IMEI changed");
                if (row.getCell(8).getCellType()!=CellType.STRING || !row.getCell(8).getStringCellValue().equals("=CHW"))
                    throw new AssertionError("User text must not become a formula");
                System.out.println("PASS: exported filters, text identifiers and formula-like strings");
            }
            return;
        }
        for (String name : new String[]{"valid", "formula", "numeric", "duplicate", "unknown", "clear"}) {
            try (XSSFWorkbook book = new XSSFWorkbook()) {
                Sheet sheet = book.createSheet("Devices"); Row header=sheet.createRow(0);
                header.createCell(0).setCellValue("Device number"); header.createCell(1).setCellValue("Owner name");
                Row row=sheet.createRow(1); row.createCell(0).setCellValue(name.equals("unknown") ? "NOT-ACCESSIBLE" : "00001");
                row.createCell(1).setCellValue(name.equals("clear") ? "" : "CHW Test");
                if(name.equals("formula"))row.getCell(1).setCellFormula("1+1");
                if(name.equals("numeric"))row.getCell(0).setCellValue(1);
                if(name.equals("duplicate")){Row second=sheet.createRow(2);second.createCell(0).setCellValue("00001");second.createCell(1).setCellValue("Duplicate");}
                try(OutputStream output=Files.newOutputStream(directory.resolve(name+".xlsx"))){book.write(output);}
            }
        }
    }
}
