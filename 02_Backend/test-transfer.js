const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testTransferFlow() {
  console.log('🧪 Starting Application Transfer Verification Tests...\n');

  const timestamp = Date.now();
  const seekerEmail = `seeker_${timestamp}@test.com`;
  const emp1Email = `emp1_${timestamp}@test.com`;
  const emp2Email = `emp2_${timestamp}@test.com`;

  let seekerToken, seekerId;
  let emp1Token, emp1Id;
  let emp2Token, emp2Id;
  let adminToken;
  let jobId;
  let applicationId;

  try {
    // 1. Register users
    console.log('1. Registering users...');
    
    // Register Seeker
    const seekerReg = await axios.post(`${API_URL}/auth/register`, {
      firstName: 'Seeker',
      lastName: 'User',
      email: seekerEmail,
      password: 'Password123',
      role: 'jobseeker'
    });
    seekerToken = seekerReg.data.token;
    seekerId = seekerReg.data.user._id;
    console.log(`✅ Seeker registered: ${seekerEmail} (ID: ${seekerId})`);

    // Register Employer 1
    const emp1Reg = await axios.post(`${API_URL}/auth/register`, {
      firstName: 'EmployerOne',
      lastName: 'User',
      email: emp1Email,
      password: 'Password123',
      role: 'employer',
      companyName: 'Company One'
    });
    emp1Id = emp1Reg.data.user._id;
    console.log(`✅ Employer 1 registered: ${emp1Email} (ID: ${emp1Id})`);

    // Register Employer 2
    const emp2Reg = await axios.post(`${API_URL}/auth/register`, {
      firstName: 'EmployerTwo',
      lastName: 'User',
      email: emp2Email,
      password: 'Password123',
      role: 'employer',
      companyName: 'Company Two'
    });
    emp2Id = emp2Reg.data.user._id;
    console.log(`✅ Employer 2 registered: ${emp2Email} (ID: ${emp2Id})`);

    // 2. Log in as admin and approve both employers
    console.log('\n2. Logging in as admin and approving employers...');
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@careerflux.io',
      password: 'Password123'
    });
    adminToken = adminLogin.data.token;
    console.log('✅ Admin logged in.');

    await axios.put(`${API_URL}/admin/users/${emp1Id}/status`, { isActive: true }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Employer 1 approved.`);

    await axios.put(`${API_URL}/admin/users/${emp2Id}/status`, { isActive: true }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✅ Employer 2 approved.`);

    // 3. Log in as approved Employers
    console.log('\n3. Logging in as employers...');
    const emp1Login = await axios.post(`${API_URL}/auth/login`, {
      email: emp1Email,
      password: 'Password123'
    });
    emp1Token = emp1Login.data.token;
    console.log('✅ Employer 1 logged in.');

    const emp2Login = await axios.post(`${API_URL}/auth/login`, {
      email: emp2Email,
      password: 'Password123'
    });
    emp2Token = emp2Login.data.token;
    console.log('✅ Employer 2 logged in.');

    // 4. Employer 1 creates a Job
    console.log('\n4. Employer 1 creating a job...');
    const jobRes = await axios.post(`${API_URL}/jobs`, {
      title: 'Full Stack Engineer',
      company: 'Company One',
      location: 'Remote',
      type: 'full-time',
      category: 'Software Development',
      description: 'Looking for a Senior Full Stack Engineer.',
      requirements: ['Node.js', 'React', 'MongoDB'],
      salary: { min: 120000, max: 140000, currency: 'USD' }
    }, {
      headers: { Authorization: `Bearer ${emp1Token}` }
    });
    jobId = jobRes.data.job._id;
    console.log(`✅ Job created: ${jobRes.data.job.title} (ID: ${jobId})`);

    // 5. Seeker applies for the Job
    console.log('\n5. Seeker applying for the job...');
    const appRes = await axios.post(`${API_URL}/applications`, {
      jobId: jobId,
      coverLetter: 'I am highly interested in this role.'
    }, {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    applicationId = appRes.data.application._id;
    console.log(`✅ Application submitted (ID: ${applicationId})`);

    // 6. Employer 1 gets active employers list
    console.log('\n6. Fetching active employers list...');
    const employersRes = await axios.get(`${API_URL}/applications/employers`, {
      headers: { Authorization: `Bearer ${emp1Token}` }
    });
    const employersList = employersRes.data.employers;
    console.log(`✅ Fetched active employers list (count: ${employersList.length})`);
    
    // Verify Employer 2 is in the list
    const foundEmp2 = employersList.find(e => e._id === emp2Id);
    if (foundEmp2) {
      console.log(`✅ Found Employer 2 in active list: ${foundEmp2.firstName} ${foundEmp2.lastName || ''}`);
    } else {
      console.error(`❌ Employer 2 not found in active list!`);
    }

    // 7. Employer 1 transfers application to Employer 2
    console.log(`\n7. Employer 1 transferring application to Employer 2...`);
    const transferRes = await axios.put(`${API_URL}/applications/${applicationId}/transfer`, {
      assignedTo: emp2Id
    }, {
      headers: { Authorization: `Bearer ${emp1Token}` }
    });

    const updatedApp = transferRes.data.application;
    if (updatedApp.assignedTo && updatedApp.assignedTo._id === emp2Id) {
      console.log(`✅ Application successfully assigned to Employer 2 (${updatedApp.assignedTo.firstName} ${updatedApp.assignedTo.lastName})`);
    } else {
      console.error(`❌ Assignment verification failed!`);
    }

    // Verify system log message in replies
    const latestReply = updatedApp.replies[updatedApp.replies.length - 1];
    if (latestReply && latestReply.message.includes('[System] Application assigned to')) {
      console.log(`✅ System log reply added: "${latestReply.message}"`);
    } else {
      console.error(`❌ System log reply missing or incorrect!`, latestReply);
    }

    // 7.5. Employer 2 fetches assigned applications list (Dashboard verification)
    console.log(`\n7.5. Employer 2 fetching assigned applications list...`);
    const assignedRes = await axios.get(`${API_URL}/applications/assigned`, {
      headers: { Authorization: `Bearer ${emp2Token}` }
    });
    const assignedList = assignedRes.data.applications;
    console.log(`✅ Fetched assigned list (count: ${assignedList.length})`);
    const foundAssigned = assignedList.find(a => a._id === applicationId);
    if (foundAssigned && foundAssigned.job?._id === jobId && foundAssigned.applicant?._id === seekerId) {
      console.log(`✅ Verified assigned application is correctly retrieved and populated in Employer 2's list.`);
    } else {
      console.error(`❌ Assigned application not found or incomplete in Employer 2's list!`);
    }

    // 8. Employer 2 unassigns the application (since any employer can modify/reply)
    console.log(`\n8. Employer 2 unassigning the application...`);
    const unassignRes = await axios.put(`${API_URL}/applications/${applicationId}/transfer`, {
      assignedTo: null
    }, {
      headers: { Authorization: `Bearer ${emp2Token}` }
    });

    const unassignedApp = unassignRes.data.application;
    if (unassignedApp.assignedTo === null) {
      console.log(`✅ Application successfully unassigned.`);
    } else {
      console.error(`❌ Unassignment verification failed!`);
    }

    // Verify unassignment system log message
    const unassignReply = unassignedApp.replies[unassignedApp.replies.length - 1];
    if (unassignReply && unassignReply.message.includes('[System] Application unassigned')) {
      console.log(`✅ Unassignment system log reply added: "${unassignReply.message}"`);
    } else {
      console.error(`❌ Unassignment system log reply missing!`, unassignReply);
    }

    // 9. Admin toggles job status and deletes it
    console.log(`\n9. Admin toggling job status and deleting it...`);
    const deactivateJobRes = await axios.put(`${API_URL}/admin/jobs/${jobId}/status`, {
      isActive: false
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (deactivateJobRes.data.job.isActive === false) {
      console.log(`✅ Admin successfully deactivated the job.`);
    } else {
      console.error(`❌ Admin deactivation failed!`);
    }

    const deleteJobRes = await axios.delete(`${API_URL}/admin/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (deleteJobRes.status === 200) {
      console.log(`✅ Admin successfully deleted the job.`);
    } else {
      console.error(`❌ Admin deletion failed!`);
    }

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (err) {
    console.error('❌ Test failed with error:', err.response?.data || err.message);
  }
}

testTransferFlow();
