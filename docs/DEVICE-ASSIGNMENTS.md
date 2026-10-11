# Device assignments and Excel

## Deployment

Back up the database and uploaded files before rebuilding the server. Deploy the
custom server image using `bash ./deploy.sh rebuild`. Liquibase adds two tables;
it does not remove existing device records or overwrite the three legacy custom
fields. No launcher update or re-enrollment is needed.

## Assign a device

Open **Devices -> Assignments**. Default fields are Owner name, Organization,
District, Chiefdom and Facility. Use the edit icon on a device row to fill or
update them. The device must already be enrolled/registered.

An administrator with the `settings` permission can open the settings icon to
add or hide fields (up to 30). Field names identify the stored values: hiding a
field does not delete its data, and adding the same exact name restores it.
Changing a name by removing and adding creates a different field; export and
import if values need to move to a new name. Values are text, up to 500 characters.
The existing fixed Custom 1/2/3 settings remain separate and unchanged.

## Search and export

The main Devices search and the assignment search include custom assignment
values. The assignment view adds an exact field-value filter and a monitoring
status filter. Pagination and exports use the same filters and existing tenant
and device-group access rules. Export Excel on the main Devices page uses that
page's filters, exporting all matching rows rather than just the displayed page.

Exports contain device number, IMEI, phone, status, UTC last-seen time,
configuration, serial, description and all configured assignment fields. All
identifiers are Excel text cells to preserve leading zeros and long IMEIs. The
export limit is 10,000 devices; narrow the filters for larger fleets.

## Import assignments

1. Export the required devices, or prepare a single-sheet `.xlsx` workbook with
   a **Device number** column and one or more exact custom-field headings.
2. Keep Device number cells formatted/stored as text. Do not convert numbers to
   numeric cells: a leading zero lost in Excel cannot safely be reconstructed.
3. Fill the assignment columns. The import limit is 2,000 rows and 5 MB.
4. Choose Import Excel and review the paginated preview. Nothing is saved yet.
5. Confirm replacement of the supplied fields and apply the import.

Blank cells in supplied custom-field columns clear existing values. Omitted
columns leave values unchanged. Read-only export columns such as IMEI and Status
are ignored; imports cannot alter enrollment or device configuration. Duplicate
device numbers, inaccessible/unknown devices, unknown headings, formulas, error
cells, oversized values and changed field definitions reject the update.
Updates are applied together, not partially. No new device is created by import.

Users need `edit_devices` to edit or import assignments. Export files contain
personal information; store them securely and share only with authorized staff.
The database records the most recent editing user/time, not a full change history.

## Inactivity policy

The default red/inactive threshold is now **30 days** (previously four hours).
Change it per tenant using the settings icon in Assignments, from 1 to 3,650 days.
The same threshold controls the main Devices red status and status sorting, the
assignment monitoring filter and Excel exports.

- Green: connected within the last two hours.
- Yellow: not recently connected, but still within the inactivity policy.
- Red: at or beyond the inactivity threshold, or never connected.

Yellow is not a claim that a device is online. This policy changes monitoring
classification only; it does not change MQTT connectivity, lock devices or wipe
them. The existing explicit last-seen time filters remain available. Refresh an
open Devices page after changing the policy, or allow its automatic refresh.
