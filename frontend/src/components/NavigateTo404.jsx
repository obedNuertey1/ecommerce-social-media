import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NavigateTo404 = () => {
  const navigate = useNavigate();
  useEffect(()=>{
      navigate("/404");
  },[])
  return (
    <></>
  );
};

export default NavigateTo404;