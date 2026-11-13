import ExcelJS from 'exceljs';
import { dbService } from '../services/db';
import { maskAadhaar, maskPAN } from './validation';

export async function exportAllDataToExcel(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'JAY AMBE DATA ENTRY APP';
  workbook.lastModifiedBy = 'Sales Network System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Common Header Style
  const headerStyle: Partial<ExcelJS.Style> = {
    font: { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF064E3B' }, // Dark Green theme
    },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF047857' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    },
  };

  const dataRowBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };

  // 1. Fetch all data
  const [shops, mechanics, reborers, employees, idDataList, shopLinks, reborerLinks] =
    await Promise.all([
      dbService.getRetailShops(),
      dbService.getMechanics(),
      dbService.getReborers(),
      dbService.getEmployees(),
      dbService.getIdDataList(),
      dbService.getAllShopMechanicLinks(),
      dbService.getAllReborerEmployeeLinks(),
    ]);

  const mechanicsMap = new Map(mechanics.map((m) => [m.id, m]));
  const shopsMap = new Map(shops.map((s) => [s.id, s]));
  const employeesMap = new Map(employees.map((e) => [e.id, e]));
  const reborersMap = new Map(reborers.map((r) => [r.id, r]));

  // ==========================================
  // SHEET 1: RETAIL SHOPS
  // ==========================================
  const wsShops = workbook.addWorksheet('Retail Shops', {
    views: [{ showGridLines: true }],
  });

  wsShops.columns = [
    { header: 'S.No', key: 'sno', width: 8 },
    { header: 'Shop ID', key: 'id', width: 22 },
    { header: 'Shop Name', key: 'shopName', width: 26 },
    { header: 'Owner Name', key: 'ownerName', width: 24 },
    { header: 'Mobile Number', key: 'mobileNumber', width: 16 },
    { header: 'Address', key: 'address', width: 34 },
    { header: 'Date of Birth', key: 'dateOfBirth', width: 14 },
    { header: 'Segment', key: 'segment', width: 22 },
    { header: 'Connected Mechanics', key: 'connectedMechanics', width: 44 },
    { header: 'Total Mechanics', key: 'totalMechanics', width: 16 },
    { header: 'Registration Date', key: 'createdAt', width: 20 },
  ];

  shops.forEach((shop, index) => {
    const linked = shopLinks
      .filter((l) => l.shopId === shop.id)
      .map((l) => {
        const mech = mechanicsMap.get(l.mechanicId);
        return mech
          ? `${mech.garageName} (${mech.ownerName}: ${mech.ownerMobileNumber})`
          : 'Unknown Mechanic';
      });

    const row = wsShops.addRow({
      sno: index + 1,
      id: shop.id,
      shopName: shop.shopName,
      ownerName: shop.ownerName,
      mobileNumber: shop.mobileNumber,
      address: shop.address,
      dateOfBirth: shop.dateOfBirth || '-',
      segment: shop.segment || '-',
      connectedMechanics: linked.length > 0 ? linked.join('\n') : 'None',
      totalMechanics: linked.length,
      createdAt: new Date(shop.createdAt).toLocaleDateString(),
    });

    row.eachCell((cell) => {
      cell.border = dataRowBorder;
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
  });

  // Apply header styling
  wsShops.getRow(1).height = 30;
  wsShops.getRow(1).eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  // ==========================================
  // SHEET 2: MECHANICS
  // ==========================================
  const wsMechanics = workbook.addWorksheet('Mechanic', {
    views: [{ showGridLines: true }],
  });

  wsMechanics.columns = [
    { header: 'S.No', key: 'sno', width: 8 },
    { header: 'Mechanic ID', key: 'id', width: 22 },
    { header: 'Garage Name', key: 'garageName', width: 26 },
    { header: 'Owner Name', key: 'ownerName', width: 24 },
    { header: 'Owner Mobile', key: 'ownerMobileNumber', width: 16 },
    { header: 'Foreman Name', key: 'foremanName', width: 22 },
    { header: 'Foreman Mobile', key: 'foremanMobileNumber', width: 16 },
    { header: 'Address', key: 'address', width: 34 },
    { header: 'Date of Birth', key: 'dateOfBirth', width: 14 },
    { header: 'Deal in Segment', key: 'dealInSegments', width: 30 },
    { header: 'Purchase Name', key: 'purchaseName', width: 22 },
    { header: 'Connected Retail Shops', key: 'connectedShops', width: 38 },
    { header: 'Remark', key: 'remark', width: 24 },
    { header: 'Registration Date', key: 'createdAt', width: 20 },
  ];

  mechanics.forEach((mech, index) => {
    const linkedShops = shopLinks
      .filter((l) => l.mechanicId === mech.id)
      .map((l) => {
        const sh = shopsMap.get(l.shopId);
        return sh ? `${sh.shopName} (${sh.mobileNumber})` : 'Unknown Shop';
      });

    const row = wsMechanics.addRow({
      sno: index + 1,
      id: mech.id,
      garageName: mech.garageName,
      ownerName: mech.ownerName,
      ownerMobileNumber: mech.ownerMobileNumber,
      foremanName: mech.foremanName || '-',
      foremanMobileNumber: mech.foremanMobileNumber || '-',
      address: mech.address,
      dateOfBirth: mech.dateOfBirth || '-',
      dealInSegments: mech.dealInSegments?.length ? mech.dealInSegments.join(', ') : '-',
      purchaseName: mech.purchaseName || '-',
      connectedShops: linkedShops.length > 0 ? linkedShops.join('\n') : 'None',
      remark: mech.remark || '-',
      createdAt: new Date(mech.createdAt).toLocaleDateString(),
    });

    row.eachCell((cell) => {
      cell.border = dataRowBorder;
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
  });

  wsMechanics.getRow(1).height = 30;
  wsMechanics.getRow(1).eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  // ==========================================
  // SHEET 3: REBORERS
  // ==========================================
  const wsReborers = workbook.addWorksheet('Reborer', {
    views: [{ showGridLines: true }],
  });

  wsReborers.columns = [
    { header: 'S.No', key: 'sno', width: 8 },
    { header: 'Reborer ID', key: 'id', width: 22 },
    { header: 'Repowering Name', key: 'repoweringName', width: 26 },
    { header: 'Owner Mobile', key: 'ownerMobileNumber', width: 16 },
    { header: 'Address', key: 'address', width: 34 },
    { header: 'Date of Birth', key: 'dateOfBirth', width: 14 },
    { header: 'Segment', key: 'segment', width: 22 },
    { header: 'Work in Employees', key: 'employees', width: 38 },
    { header: 'Total Employees', key: 'totalEmployees', width: 16 },
    { header: 'Remark', key: 'remark', width: 24 },
    { header: 'Registration Date', key: 'createdAt', width: 20 },
  ];

  reborers.forEach((reb, index) => {
    const linkedEmps = reborerLinks
      .filter((l) => l.reborerId === reb.id)
      .map((l) => {
        const emp = employeesMap.get(l.employeeId);
        return emp ? `${emp.employeeName} (${emp.mobileNumber})` : 'Unknown Employee';
      });

    const row = wsReborers.addRow({
      sno: index + 1,
      id: reb.id,
      repoweringName: reb.repoweringName,
      ownerMobileNumber: reb.ownerMobileNumber,
      address: reb.address,
      dateOfBirth: reb.dateOfBirth || '-',
      segment: reb.segment || '-',
      employees: linkedEmps.length > 0 ? linkedEmps.join('\n') : 'None',
      totalEmployees: linkedEmps.length,
      remark: reb.remark || '-',
      createdAt: new Date(reb.createdAt).toLocaleDateString(),
    });

    row.eachCell((cell) => {
      cell.border = dataRowBorder;
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
  });

  wsReborers.getRow(1).height = 30;
  wsReborers.getRow(1).eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  // ==========================================
  // SHEET 4: EMPLOYEES
  // ==========================================
  const wsEmployees = workbook.addWorksheet('Employees', {
    views: [{ showGridLines: true }],
  });

  wsEmployees.columns = [
    { header: 'S.No', key: 'sno', width: 8 },
    { header: 'Employee ID', key: 'id', width: 22 },
    { header: 'Employee Name', key: 'employeeName', width: 26 },
    { header: 'Mobile Number', key: 'mobileNumber', width: 16 },
    { header: 'Date of Birth', key: 'dateOfBirth', width: 14 },
    { header: 'Linked Reborers', key: 'linkedReborers', width: 36 },
    { header: 'Registration Date', key: 'createdAt', width: 20 },
  ];

  employees.forEach((emp, index) => {
    const linkedRebs = reborerLinks
      .filter((l) => l.employeeId === emp.id)
      .map((l) => {
        const reb = reborersMap.get(l.reborerId);
        return reb ? `${reb.repoweringName} (${reb.ownerMobileNumber})` : 'Unknown Reborer';
      });

    const row = wsEmployees.addRow({
      sno: index + 1,
      id: emp.id,
      employeeName: emp.employeeName,
      mobileNumber: emp.mobileNumber,
      dateOfBirth: emp.dateOfBirth || '-',
      linkedReborers: linkedRebs.length > 0 ? linkedRebs.join('\n') : 'None',
      createdAt: new Date(emp.createdAt).toLocaleDateString(),
    });

    row.eachCell((cell) => {
      cell.border = dataRowBorder;
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
  });

  wsEmployees.getRow(1).height = 30;
  wsEmployees.getRow(1).eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  // ==========================================
  // SHEET 5: ID DATA
  // ==========================================
  const wsIdData = workbook.addWorksheet('ID Data', {
    views: [{ showGridLines: true }],
  });

  wsIdData.columns = [
    { header: 'S.No', key: 'sno', width: 8 },
    { header: 'Record ID', key: 'id', width: 22 },
    { header: 'Firm Name', key: 'firmName', width: 26 },
    { header: 'Name', key: 'name', width: 24 },
    { header: 'ID Name', key: 'idName', width: 22 },
    { header: 'Aadhaar (Masked)', key: 'aadhaarNumber', width: 20 },
    { header: 'PAN Number (Masked)', key: 'panNumber', width: 22 },
    { header: 'Password Protection', key: 'passwordStatus', width: 38 },
    { header: 'Registration Date', key: 'createdAt', width: 20 },
  ];

  idDataList.forEach((item, index) => {
    const row = wsIdData.addRow({
      sno: index + 1,
      id: item.id,
      firmName: item.firmName,
      name: item.name,
      idName: item.idName,
      aadhaarNumber: maskAadhaar(item.aadhaarNumber),
      panNumber: maskPAN(item.panNumber),
      passwordStatus: 'ENCRYPTED (Excluded for security)',
      createdAt: new Date(item.createdAt).toLocaleDateString(),
    });

    row.eachCell((cell) => {
      cell.border = dataRowBorder;
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
  });

  wsIdData.getRow(1).height = 30;
  wsIdData.getRow(1).eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  // Generate binary and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const nowStr = new Date().toISOString().split('T')[0];
  const filename = `JAY_AMBE_SALES_NETWORK_DATA_${nowStr}.xlsx`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
