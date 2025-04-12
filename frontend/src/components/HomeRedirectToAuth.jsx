import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HomeRedirectToAuth = () => {
  const navigate = useNavigate();
  useEffect(()=>{
      navigate("/auth");
  },[])
  return (
    <></>
  );
};

export default HomeRedirectToAuth;