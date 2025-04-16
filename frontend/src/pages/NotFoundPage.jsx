import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const {playNotification: playNotFoundSound} = useNotifications("not_found_sound");
  const navigate = useNavigate();
  useEffect(()=>{
    playNotFoundSound();
    return ()=>{};
  },[]);
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl max-w-md w-full">
        <div className="card-body items-center text-center">
          <figure className="text-primary">
            <AlertTriangle size={64} />
          </figure>
          
          <div className="space-y-4">
            <h1 className="text-9xl font-bold text-primary">404</h1>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold">Page Not Found</h2>
              <p className="text-base-content/70">
                Oops! The page you're looking for seems to have vanished into the digital void.
              </p>
            </div>

            <button onClick={()=>navigate(-1)} className="btn btn-primary gap-2">
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;