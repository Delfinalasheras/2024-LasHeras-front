import React from 'react'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const NavItem = ({route, name, icon, setOpenBar}) => {
  return (
    <>
        {window.innerWidth > '768' ? 
            <Link  to={route} className="text-white font-quicksand flex items-center text-sm hover:mt-1 hover:underline-offset-2 hover:border-b-1 hover:border-b-white  " > 
                <FontAwesomeIcon className="text-white text-md pr-2" icon={icon} />
                <p>{name}</p>
            </Link>
        :
            <Link onClick={()=>setOpenBar(false)} to={route} className="text-white flex items-center justify-start  py-2 px-4 xs:px-1 rounded-lg border-2 border-white xs:border-none font-quicksand text-xl xs:text-xs hover:mt-1 hover:underline-offset-2 hover:border-b-1 hover:border-b-white  " > 
                <FontAwesomeIcon className="text-white text-md pr-2 " icon={icon} />
                <p className=' text-left ml-2 '>{name}</p>
            </Link>
        }

    </>
  )
}

export default NavItem