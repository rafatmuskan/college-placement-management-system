import React, { useEffect, useState } from 'react'
import Accordion from 'react-bootstrap/Accordion';
import { useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { Button } from 'react-bootstrap';
import UploadOfferLetter from './UploadOfferLetter';
import Toast from '../Toast';

function UpdateJobStatus() {
  const BASE_URL = "http://localhost:4518";
  const navigate = useNavigate();

  const { jobId } = useParams();

  const [data, setData] = useState({});
  const [company, setCompany] = useState(null);
  // for applicants of job 
  const [applicant, setApplicant] = useState({});
  // useState for load data
  const [currentUser, setCurrentUser] = useState({});

  const [loading, setLoading] = useState(true);

  // useState for toast display
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // checking for authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:4518/user/detail', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        setCurrentUser({
          id: res.data.id,
          first_name: res.data.first_name,
          middle_name: res.data.middle_name,
          last_name: res.data.last_name,
          email: res.data.email,
          number: res.data.number,
          role: res.data.role,
          uin: res.data.studentProfile.uin,
        });
      })
      .catch(err => {
        console.log("AddUserTable.jsx => ", err);
        setToastMessage(err);
        setShowToast(true);
      });
  }, []);

  const fetchJobDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:4518/tpo/job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      )
      setData(response.data);
    } catch (error) {
      if (error.response) {
        if (error?.response.data?.msg) setToastMessage(error.response.data.msg)
        else setToastMessage(error.message)
        setShowToast(true);
        if (error?.response?.data?.msg === "job data not found") navigate('../404');
      }
      console.log("Error while fetching details => ", error);
    }
  }

  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(`http://localhost:4518/company/company-data?companyId=${data.company}`);
      setCompany(response.data.company);
    } catch (error) {
      console.log("AddCompany error while fetching => ", error);
    }
  }

  const fetchJobDetailsOfApplicant = async () => {
    if (data?.applicants?.length !== 0) {
      // Find if the student user has applied
      const appliedApplicant = await data.applicants.find(app => app.studentId === currentUser.id);
      
      if (appliedApplicant) setApplicant(appliedApplicant) // If no applicant found, navigate to 404
      else navigate('../404');
    } else {
      // no data in applicants
      navigate('../404');
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`http://localhost:4518/student/update-status/${jobId}/${currentUser.id}`, { applicant });
      // console.log(response.data);
      if (response?.data?.msg) {
        setToastMessage(response?.data?.msg);
        setShowToast(true);
      }
    } catch (error) {
      if (error?.response?.data?.msg) {
        setToastMessage(error?.response?.data?.msg);
        setShowToast(true);
      }
      console.log("Error while update job status => ", error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchJobDetail();
        if (data?.company) {
          await fetchCompanyData();
        }
        if (data?.applicants && currentUser?.id) {
          fetchJobDetailsOfApplicant();
        }
        setLoading(false);
      } catch (error) {
        setToastMessage("Error during fetching and applying job");
        setShowToast(true);
        console.error("Error during fetching and applying job:", error);
      }
    };

    fetchData();
  }, [currentUser?.id, data?.company, jobId]);

  const handleApplicantChange = (e) => {
    setApplicant({
      ...applicant,
      [e.target.name]: e.target.value
    });
  }

  // for formating date of birth
  const formatDate = (isoString) => {
    if (!isoString || isoString === "undefined") return "";
    const date = new Date(isoString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  // console.log(applicant);

  return (
    <>
      {/*  any message here  */}
      < Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        delay={3000}
        position="bottom-end"
      />

      {
        loading ? (
          <div className="flex justify-center h-72 items-center">
            <i className="fa-solid fa-spinner fa-spin text-3xl" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 my-6">
              <div className="flex flex-col grid-flow-row-dense gap-2">

                <div className="text-base">
                  {/* Basic Details  */}
                  <Accordion defaultActiveKey={['0']} alwaysOpen className='shadow rounded'>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>Basic Details</Accordion.Header>
                      <Accordion.Body>
                        <div className="">
                          {/* company name  */}
                          <div className="flex flex-col justify-between py-2">
                            {/* Basic Info */}
                            <div className="flex justify-between">
                              <div className="space-y-4">
                                <div>
                                  <span className="text-gray-700 font-bold">Full Name: </span>
                                  <span className="text-blue-500 font-bold">
                                    {currentUser?.first_name + " "}
                                    {currentUser?.middle_name && currentUser?.middle_name + " "}
                                    {currentUser?.last_name}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-gray-700 font-bold">Email: </span>
                                  <span className="text-blue-500 font-bold">
                                    {currentUser?.email}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-gray-700 font-bold">Number: </span>
                                  <span className="text-blue-500 font-bold">
                                    {currentUser?.number}
                                  </span>
                                </div>

                                {
                                  currentUser?.uin && (
                                    <div>
                                      <span className="text-gray-700 font-bold">UIN: </span>
                                      <span className="text-blue-500 font-bold">
                                        {currentUser?.uin}
                                      </span>
                                    </div>
                                  )
                                }
                                <div>
                                  <span className="text-gray-700 font-bold">Company Name: </span>
                                  <span className="text-blue-500 font-bold">
                                    {company?.companyName}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-700 font-bold">Job Title: </span>
                                  <span className="text-blue-500 font-bold">
                                    {data?.jobTitle}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              </div>


              <div className="text-base">
                {/* Job details  */}
                <Accordion defaultActiveKey={['1']} alwaysOpen className='shadow rounded'>
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Job Details</Accordion.Header>
                    <Accordion.Body>
                      <div className="">
                        <div className="grid grid-cols-2 gap-4">
                          {/* current round  */}
                          <FloatingLabel controlId="floatingSelectCurrentRound" label="Current Round">
                            <Form.Select
                              aria-label="Floating label select current round"
                              className='cursor-pointer'
                              name='currentRound'
                              value={applicant?.currentRound || "undefined"}
                              onChange={handleApplicantChange}
                            >
                              <option disabled value="undefined" className='text-gray-400'>Enter Current Round</option>
                              <option value="Aptitude Test">Aptitude Test</option>
                              <option value="Technical Interview">Technical Interview</option>
                              <option value="HR Interview">HR Interview</option>
                              <option value="Group Discussion">Group Discussion</option>
                            </Form.Select>
                          </FloatingLabel>
                          {/* round status  */}
                          <FloatingLabel controlId="floatingSelectRoundStatus" label="Round Status">
                            <Form.Select
                              aria-label="Floating label select round status"
                              className='cursor-pointer'
                              name='roundStatus'
                              value={applicant?.roundStatus || "undefined"}
                              onChange={handleApplicantChange}
                            >
                              <option disabled value="undefined" className='text-gray-400'>Enter Round Status</option>
                              <option value="pending">Pending</option>
                              <option value="passed">Passed</option>
                              <option value="failed">Failed</option>
                            </Form.Select>
                          </FloatingLabel>
                          {/* selection date */}
                          <FloatingLabel controlId="floatingSelectionDate" label="Selection Date">
                            <Form.Control
                              type="date"
                              placeholder="Selection Date"
                              name='selectionDate'
                              value={formatDate(applicant?.selectionDate)}
                              onChange={handleApplicantChange}
                            />
                          </FloatingLabel>
                          {/* joining date */}
                          <FloatingLabel controlId="floatingJoiningDate" label="Joining Date">
                            <Form.Control
                              type="date"
                              placeholder="Joining Date"
                              name='joiningDate'
                              value={formatDate(applicant?.joiningDate)}
                              onChange={handleApplicantChange}
                            />
                          </FloatingLabel>
                          <div className="flex flex-col gap-2 justify-center items-center">

                            {/* offer letter upload */}
                            <UploadOfferLetter jobId={jobId} />
                            {
                              applicant?.offerLetter &&
                              <div className="cursor-pointer w-fit">
                                <span className='bg-blue-500 px-3 py-1 rounded transition-colors duration-200 hover:bg-blue-700 '>
                                  <a
                                    className='text-white no-underline'
                                    target="_blanck"
                                    href={BASE_URL + applicant?.offerLetter}
                                  >
                                    <i className="fa-regular fa-eye pr-2" />
                                    View Offer Letter
                                  </a>
                                </span>
                              </div>
                            }
                          </div>
                          {/* job status  */}
                          <FloatingLabel controlId="floatingSelectJobStatus" label="Job Status">
                            <Form.Select
                              aria-label="Floating label select job status"
                              className='cursor-pointer'
                              name='status'
                              value={applicant?.status || "undefined"}
                              onChange={handleApplicantChange}
                            >
                              <option disabled value="undefined" className='text-gray-400'>Enter Job Status</option>
                              <option value="applied">Applied</option>
                              <option value="interview">Interview</option>
                              <option value="hired">Hired</option>
                              <option value="rejected">Rejected</option>
                            </Form.Select>
                          </FloatingLabel>
                        </div>
                        <div className="mb-2 mt-3" onClick={handleSubmit}>
                          <Button variant="primary">
                            <i className="fa-solid fa-floppy-disk pr-2" />
                            Update
                          </Button>
                        </div>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>

            </div>
          </>
        )
      }
    </>
  )
}

export default UpdateJobStatus
