const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('client/src', file => {
  if (!file.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix res.data?.data?.employees -> res.data?.data
  if (content.includes('res.data?.data?.employees')) {
    content = content.replace(/res\.data\?\.data\?\.employees/g, 'res.data?.data');
    changed = true;
  }
  
  if (content.includes('response.data?.data?.employees')) {
    content = content.replace(/response\.data\?\.data\?\.employees/g, 'response.data?.data');
    changed = true;
  }
  
  // Fix totalPages
  if (content.includes('response.data?.data?.totalPages')) {
    content = content.replace(/response\.data\?\.data\?\.totalPages/g, 'response.data?.pagination?.totalPages');
    changed = true;
  }
  if (content.includes('res.data?.data?.totalPages')) {
    content = content.replace(/res\.data\?\.data\?\.totalPages/g, 'res.data?.pagination?.totalPages');
    changed = true;
  }

  // Fix DocumentList.jsx and UserList.jsx setEmployees
  if (content.includes('setEmployees(res.data || [])')) {
    content = content.replace(/setEmployees\(res\.data \|\| \[\]\)/g, 'setEmployees(res.data?.data || [])');
    changed = true;
  }
  if (content.includes('setEmployees(eRes.data || [])')) {
    content = content.replace(/setEmployees\(eRes\.data \|\| \[\]\)/g, 'setEmployees(eRes.data?.data || [])');
    changed = true;
  }

  // Fix ReportsDashboard.jsx setData
  if (content.includes('setData(res.data || [])')) {
    content = content.replace(/setData\(res\.data \|\| \[\]\)/g, 'setData(res.data?.data || [])');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
