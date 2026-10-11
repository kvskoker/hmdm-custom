// Run only against the isolated hmdm-register-test Compose project on port 8087.
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const base='http://127.0.0.1:8087/rest/';
const root=path.resolve(__dirname,'..');
const fixtures=path.join(root,'test-results/device-register');
const sql = q => execFileSync('docker',['compose','-p','hmdm-register-test','-f',path.join(root,'docker-compose.v7-test.yml'),'exec','-T','db','psql','-U','hmdm','-d','hmdm','-v','ON_ERROR_STOP=1','-c',q],{encoding:'utf8'});
async function login(name='admin') {
  const r=await fetch(base+'public/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login:name,password:'21232F297A57A5A743894A0E4A801FC3'})});
  assert.equal((await r.json()).status,'OK');
  return r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
}
async function call(cookie,route,body) {
  return fetch(base+route,{method:body===undefined?'GET':'POST',headers:{Cookie:cookie,'Content-Type':Buffer.isBuffer(body)?'application/octet-stream':'application/json'},body:body===undefined?undefined:Buffer.isBuffer(body)?body:JSON.stringify(body)});
}
async function ok(cookie,route,body){const r=await call(cookie,route,body);assert.equal(r.status,200,await (r.status!==200?r.text():Promise.resolve('')));const j=await r.json();assert.equal(j.status,'OK',JSON.stringify(j));return j.data;}
(async()=>{
  const app=JSON.parse(execFileSync('docker',['inspect','hmdm-register-test-hmdm-1'],{encoding:'utf8'}))[0];
  assert.equal(app.Config.Labels['com.docker.compose.project'],'hmdm-register-test');
  assert.ok(app.NetworkSettings.Ports['8080/tcp']?.some(p=>p.HostIp==='127.0.0.1' && p.HostPort==='8087'),
    'Refusing to modify fixtures: port 8087 must belong to the isolated test app');
  try {
  sql(`UPDATE users SET passwordReset=false WHERE login='admin';
       DELETE FROM devices WHERE number IN ('00001','00002');
       DELETE FROM users WHERE login IN ('register-restricted','register-observer');
       DELETE FROM customers WHERE name='register-tenant-test';
       DELETE FROM deviceRegisterSettings;`);
  const cookie=await login();
  sql(`INSERT INTO devices(number,imei,customerId,configurationId,lastUpdate) SELECT '00001','012345678901234',customerId,1,(EXTRACT(EPOCH FROM NOW())*1000)::bigint-864000000 FROM users WHERE login='admin';
       INSERT INTO devices(number,customerId,configurationId,lastUpdate) SELECT '00002',customerId,1,(EXTRACT(EPOCH FROM NOW())*1000)::bigint-3456000000 FROM users WHERE login='admin';
       INSERT INTO users(login,password,customerId,userRoleId,allDevicesAvailable,passwordReset) SELECT 'register-restricted',password,customerId,userRoleId,false,false FROM users WHERE login='admin';`);
  const settings=await ok(cookie,'private/device-register/settings');assert.equal(settings.inactiveDays,30);
  const batch={fields:settings.fields,rows:[{number:'00001',values:{'Owner name':'=CHW','District':'Bo','Facility':'Test facility'}}]};
  await ok(cookie,'private/device-register/save',batch);
  const found=await ok(cookie,'private/device-register/search',{value:'=CHW'});assert.equal(found.total,1);assert.equal(found.items[0].status,'yellow');
  const core=await ok(cookie,'private/devices/search',{value:'=CHW'});assert.ok(JSON.stringify(core).includes('00001'),'Core search must find custom field values');
  const inactive=await ok(cookie,'private/device-register/search',{value:'0000',inactive:true});assert.equal(inactive.total,1);assert.equal(inactive.items[0].number,'00002');
  const exact=await ok(cookie,'private/device-register/search',{assignmentField:'District',assignmentValue:'Bo'});assert.equal(exact.total,1);
  const first=await ok(cookie,'private/device-register/search',{value:'0000',pageNum:1,pageSize:1,sortBy:'NUMBER',sortDir:'ASC'});
  const second=await ok(cookie,'private/device-register/search',{value:'0000',pageNum:2,pageSize:1,sortBy:'NUMBER',sortDir:'ASC'});
  assert.equal(first.total,2);assert.equal(first.items.length,1);assert.equal(first.items[0].number,'00001');assert.equal(second.items[0].number,'00002');
  const exported=await call(cookie,'private/device-register/export',{value:'=CHW'});assert.equal(exported.status,200);fs.writeFileSync(path.join(fixtures,'export.xlsx'),Buffer.from(await exported.arrayBuffer()));
  for(const name of ['formula','numeric','duplicate','unknown']){const r=await call(cookie,'private/device-register/preview',fs.readFileSync(path.join(fixtures,name+'.xlsx')));assert.equal(r.status,400,name);}
  const preview=await ok(cookie,'private/device-register/preview',fs.readFileSync(path.join(fixtures,'valid.xlsx')));
  assert.equal((await ok(cookie,'private/device-register/search',{value:'=CHW'})).total,1,'Preview must not write');
  await ok(cookie,'private/device-register/save',preview);
  const clear=await ok(cookie,'private/device-register/preview',fs.readFileSync(path.join(fixtures,'clear.xlsx')));await ok(cookie,'private/device-register/save',clear);
  const cleared=await ok(cookie,'private/device-register/search',{value:'00001'});assert.equal(cleared.items[0].values['Owner name'],'');assert.equal(cleared.items[0].values.District,'Bo','Omitted columns must remain unchanged');
  const invalid={fields:settings.fields,rows:[{number:'00001',values:{District:'Changed'}},{number:'MISSING',values:{District:'Changed'}}]};
  assert.equal((await call(cookie,'private/device-register/save',invalid)).status,400);
  assert.equal((await ok(cookie,'private/device-register/search',{value:'00001'})).items[0].values.District,'Bo','Invalid batch must not partially write');
  const restricted=await login('register-restricted');
  assert.equal((await ok(restricted,'private/device-register/search',{})).total,0);
  assert.equal((await call(restricted,'private/device-register/save',batch)).status,400);
  const anonymous=await call('','private/device-register/settings');assert.ok([401,403].includes(anonymous.status));
  sql(`INSERT INTO users(login,password,customerId,userRoleId,allDevicesAvailable,passwordReset) SELECT 'register-observer',password,customerId,100,true,false FROM users WHERE login='admin';
       INSERT INTO customers(name,filesdir,prefix) VALUES('register-tenant-test','register-tenant-test','regtest');
       INSERT INTO users(login,password,customerId,userRoleId,allDevicesAvailable,passwordReset)
       SELECT 'register-other-tenant',u.password,c.id,2,true,false FROM users u CROSS JOIN customers c WHERE u.login='admin' AND c.name='register-tenant-test';`);
  const observer=await login('register-observer');
  for (const route of ['private/roles/all','private/roles/permissions']) {
    assert.equal((await call(cookie,route)).status,403,'Tenant admin must not manage global roles');
    assert.equal((await call(observer,route)).status,403,'Denied role reads must not return 500');
  }
  const tableRoles=await ok(cookie,'private/users/roles');
  assert.ok(tableRoles.length>0,'Device table role choices remain available');
  await ok(cookie,`private/settings/userRole/${tableRoles[0].id}`);
  assert.equal((await call(observer,'private/device-register/save',batch)).status,403);
  assert.equal((await call(observer,'private/device-register/settings',settings)).status,403);
  const other=await login('register-other-tenant');
  assert.equal((await ok(other,'private/device-register/search',{value:'00001'})).total,0);
  assert.equal((await call(other,'private/device-register/save',batch)).status,400);
  await ok(cookie,'private/device-register/settings',{...settings,fields:settings.fields.filter(f=>f!=='Facility')});
  assert.equal((await call(cookie,'private/device-register/save',preview)).status,400,'Stale field definitions must be rejected');
  await ok(cookie,'private/device-register/settings',settings);
  assert.equal((await ok(cookie,'private/device-register/search',{value:'00001'})).items[0].values.Facility,'Test facility');
  await ok(cookie,'private/device-register/settings',{...settings,inactiveDays:5});
  assert.equal((await ok(cookie,'private/device-register/search',{value:'00001'})).items[0].status,'red');
  assert.equal((await call(cookie,'private/device-register/settings',{...settings,inactiveDays:0})).status,400);
  assert.equal((await ok(other,'private/device-register/settings')).inactiveDays,30,'Policy is per tenant');
  await ok(cookie,'private/device-register/settings',settings);
  console.log('PASS: search, filters, policy, export, preview/apply, workbook validation, atomic rejection, field retention, read-only, tenant and group access');
  } finally {
    // Do not leave the preview server in multi-tenant mode after access tests.
    sql("DELETE FROM customers WHERE name='register-tenant-test'; DELETE FROM users WHERE login IN ('register-restricted','register-observer');");
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
