import * as React from 'react';
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const Calendar = ({value, onChange}) => {
    const dayjsValue = dayjs(value);
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer className='font-quicksand' components={['DatePicker', 'DatePicker']}>
          <DatePicker
            label="Controlled picker"
            value={dayjsValue}
            onChange={onChange}
            className='font-quicksand'
          />
        </DemoContainer>
      </LocalizationProvider>
    )
}

export default Calendar