import React, { } from 'react'
import {useSelector, useDispatch, actions} from '../redux'
import {faSpinner} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

const MaskDiv = () => {
    const mask = useSelector(state => state.maskDiv)
    const dispatch = useDispatch()
    if (!mask) return null
    const {showSpinner= true, title = 'Loading', message = null, dismissable=false} = mask
    return <div className='mask' >
        {
            showSpinner && <FontAwesomeIcon size='5x' icon={faSpinner} spin/>
        }
        {
            title && <h1 className={`mt-5 ${message ? '': 'mb-5'}`}>{title}</h1>
        }
        {
            message && <p className='mb-5'>{title}</p>
        }
        {
            dismissable && <button className='btn btn-warning font-weight-bold' onClick={() => dispatch({type: actions.MASKDIV_SET, payload: false})}>Dismiss</button>
        }
    </div>
}

export default  MaskDiv