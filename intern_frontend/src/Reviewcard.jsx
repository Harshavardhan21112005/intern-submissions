import './interncard.css'
import {Navigate, useNavigate} from 'react-router-dom'

function Reviewcard() {
    const navigate=useNavigate()
  return (
    <div className="Review" onClick={()=>navigate('/review')}>
        Reviews
    </div>
  )
}

export default Reviewcard