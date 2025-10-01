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
        <DemoContainer  components={['DatePicker', 'DatePicker']}>
          <DatePicker
            value={dayjsValue}
            onChange={onChange}
            sx={{
              fontFamily: 'Quicksand, sans-serif',
              '.MuiPickersToolbar-root': {
                color: '#E5EBDF',  // Cambia el color de la barra superior
                backgroundColor: '#8ba020',  // Fondo de la barra superior
                fontFamily: 'Quicksand, sans-serif',
              },
              '.MuiInputBase-root': {
                fontFamily: 'Quicksand, sans-serif',  // Fuente para el campo de texto
                color: '#333333',  // Color del texto en el input
                borderColor: '#8ba020', 
              },
              zIndex: 0
            }}
          />
        </DemoContainer>
      </LocalizationProvider>
    )
}

export default Calendar