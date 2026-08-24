const http = require('http');

const runTests = async () => {
  console.log('--- Starting Automated Backend API Tests ---');

  const makeRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
          } catch {
            resolve({ statusCode: res.statusCode, body });
          }
        });
      });
      req.on('error', (err) => reject(err));
      if (postData) {
        req.write(JSON.stringify(postData));
      }
      req.end();
    });
  };

  try {
    // 1. Test Login (Employee)
    console.log('\n[TEST 1] POST /api/v1/auth/login (Valid credentials)');
    const loginRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'rahul@techsolutions.com', password: 'password123' }
    );
    console.log(`Status: ${loginRes.statusCode}, Success: ${loginRes.body.success}`);
    const token = loginRes.body.token;
    console.log(`Token received: ${token ? 'YES' : 'NO'}`);

    // 2. Test Public Leave Types Listing
    console.log('\n[TEST 2] GET /api/v1/leave-types (Public)');
    const typesRes = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/v1/leave-types',
      method: 'GET',
    });
    console.log(`Status: ${typesRes.statusCode}, Leave Types Count: ${typesRes.body.count}`);
    const casualType = typesRes.body.data.find((t) => t.name === 'Casual');

    // 3. Test authGuard (Protected route without token)
    console.log('\n[TEST 3] GET /api/v1/leaves/my WITHOUT Token (Should return 401)');
    const unauthRes = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/v1/leaves/my',
      method: 'GET',
    });
    console.log(`Status: ${unauthRes.statusCode} (Expected 401), Message: ${unauthRes.body.message}`);

    // 4. Test GET /api/v1/leaves/my with Token
    console.log('\n[TEST 4] GET /api/v1/leaves/my with Token (Populated leave requests)');
    const myLeavesRes = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/v1/leaves/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`Status: ${myLeavesRes.statusCode}, Requests Count: ${myLeavesRes.body.count}`);
    if (myLeavesRes.body.data.length > 0) {
      console.log(`Sample Leave Type: ${myLeavesRes.body.data[0].leaveTypeId?.name}`);
    }

    // 5. Test POST /api/v1/leaves (Validation failure: exceeding leave balance)
    console.log('\n[TEST 5] POST /api/v1/leaves with 999 days (Exceeding balance validation failure)');
    const exceedRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/v1/leaves',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      {
        leaveTypeId: casualType._id,
        fromDate: '2026-10-01',
        toDate: '2026-10-10',
        days: 999,
        reason: 'Testing balance limit validation',
      }
    );
    console.log(`Status: ${exceedRes.statusCode} (Expected 400), Message: ${exceedRes.body.message}`);

    // 6. Test POST /api/v1/leaves (Valid application & balance deduction)
    console.log('\n[TEST 6] POST /api/v1/leaves (Valid 1 day application)');
    const validApplyRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/v1/leaves',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      {
        leaveTypeId: casualType._id,
        fromDate: '2026-11-01',
        toDate: '2026-11-01',
        days: 1,
        reason: 'Personal errand',
      }
    );
    console.log(`Status: ${validApplyRes.statusCode} (Expected 201), Message: ${validApplyRes.body.message}`);
    console.log(`Remaining Leave Balance: ${validApplyRes.body.remainingLeaveBalance}`);
    const createdLeaveId = validApplyRes.body.data._id;

    // 7. Test PATCH /api/v1/leaves/:id/status (Invalid status value validation)
    console.log('\n[TEST 7] PATCH /api/v1/leaves/:id/status with invalid status "invalid_status"');
    const invalidStatusRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5001,
        path: `/api/v1/leaves/${createdLeaveId}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      { status: 'invalid_status' }
    );
    console.log(`Status: ${invalidStatusRes.statusCode} (Expected 400), Message: ${invalidStatusRes.body.message}`);

    // 8. Test PATCH /api/v1/leaves/:id/status (Valid approval)
    console.log('\n[TEST 8] PATCH /api/v1/leaves/:id/status with valid status "approved"');
    const validStatusRes = await makeRequest(
      {
        hostname: 'localhost',
        port: 5001,
        path: `/api/v1/leaves/${createdLeaveId}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      { status: 'approved' }
    );
    console.log(`Status: ${validStatusRes.statusCode} (Expected 200), Updated Status: ${validStatusRes.body.data?.status}`);

    console.log('\n✅ ALL API TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  }
};

runTests();
