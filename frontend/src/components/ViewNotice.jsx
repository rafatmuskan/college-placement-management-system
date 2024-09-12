import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

function ViewNotice() {
  const noticeId = useParams();
  const [notice, setNotice] = useState({});

  const fetchNotice = async () => {
    try {
      if (!noticeId) return;
      const response = await axios.get(`http://localhost:4518/management/get-notice?noticeId=${noticeId.noticeId}`);
      // console.log(response?.data);
      setNotice(response?.data);
    } catch (error) {
      console.log("error while fetching notice => ", error);
    }
  }

  useEffect(() => {
    fetchNotice();
  }, [noticeId]);

  return (
    <>
      <div className="my-4 mx-2 backdrop-blur-md bg-white/30 border border-white/20 rounded-lg py-2 px-3 shadow shadow-red-400">
        <div className="flex flex-col gap-2 justify-between">
          <span className='text-2xl my-3'>
            {notice?.title}
          </span>
          <span className='line-clamp-3'>
            {notice?.message}
          </span>
          <span className='text-right my-1 text-gray-400'>
            {new Date(notice?.createdAt).toLocaleDateString('en-IN') + " " + new Date(notice?.createdAt).toLocaleTimeString('en-IN')}
          </span>
        </div>
      </div>
    </>
  )
}

export default ViewNotice
