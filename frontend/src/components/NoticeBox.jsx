import React, { useState, useEffect } from 'react';
import Badge from 'react-bootstrap/Badge';
import { Link } from 'react-router-dom';
import axios from 'axios';

function NoticeBox() {
  const [loading, setLoading] = useState(true);

  const [noticesData, setNoticesData] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4518/user/detail', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        setCurrentUser({ role: response.data.role });
      } catch (error) {
        console.log("Error fetching user details => ", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [currentUser?.role]);

  const fetchNotices = async () => {
    try {
      const response = await axios.get('http://localhost:4518/management/get-all-notices', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });

      if (currentUser?.role === 'management_admin') {
        const filteredNotices = response?.data?.filter(notice => notice.sender_role === 'tpo_admin');
        setNoticesData(filteredNotices);
      }
      else if (currentUser?.role === 'tpo_admin') {
        const filteredNotices = response?.data?.filter(notice => notice.receiver_role === 'tpo_admin');
        setNoticesData(filteredNotices);
      }
      else if (currentUser?.role === 'student') {
        const filteredNotices = response?.data?.filter(notice => notice.receiver_role === 'student');
        setNoticesData(filteredNotices);
      }
    } catch (error) {
      console.log('Error while fetching notices => ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="my-2 mx-2 w-1/2 backdrop-blur-md bg-white/30 border border-white/20 rounded-lg py-2 px-3 shadow shadow-red-400">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold my-2">Notice</h3>
          <span className=''>
            {
              currentUser?.role === 'student' && (
                <Link to='/student/all-notice' className='no-underline text-blue-500 hover:text-blue-700'>
                  View All
                </Link>
              )
            }
            {
              currentUser?.role === 'tpo_admin' && (
                <Link to='/tpo/all-notice' className='no-underline text-blue-500 hover:text-blue-700'>
                  View All
                </Link>
              )
            }
            {
              currentUser?.role === 'management_admin' && (
                <Link to='/management/all-notice' className='no-underline text-blue-500 hover:text-blue-700'>
                  View All
                </Link>
              )
            }
          </span>
        </div>
        {loading ? (
          <div className="flex justify-center items-center">
            <i className="fa-solid fa-spinner fa-spin text-2xl" />
          </div>
        ) : (
          <div className="relative h-72 overflow-hidden">
            {/* Wrapping the notices in a div that handles the animation */}
            <div className="absolute bottom-0 w-full h-full animate-scrollUp">
              {noticesData?.length > 0 ? (
                noticesData.map((notice, index) => (
                  <div key={index} className="py-2 h-fit">
                    <Link
                      className='text-blue-500 hover:text-blue-700'
                      to={
                        currentUser?.role === 'student'
                          ? `/student/notice/${notice?._id}`
                          : currentUser?.role === 'tpo_admin'
                            ? `/tpo/notice/${notice?._id}`
                            : currentUser.role === 'management_admin'
                              ? `/management/notice/${notice?._id}`
                              : ''
                      }
                      target="_blank"
                    >
                      {notice?.title}
                      {/* Calculate the time difference in days and conditionally show the badge */}
                      {(new Date() - new Date(notice?.createdAt)) / (1000 * 60 * 60 * 24) <= 3 && (
                        <Badge className="mx-2" bg="primary">New</Badge>
                      )}
                    </Link>
                    <span className='no-underline mx-1 text-gray-400'>
                      {new Date(notice?.createdAt).toLocaleDateString('en-IN') + " " + new Date(notice?.createdAt).toLocaleTimeString('en-IN')}
                    </span>
                  </div>
                ))
              ) : (
                <div>No notices found!</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default NoticeBox
