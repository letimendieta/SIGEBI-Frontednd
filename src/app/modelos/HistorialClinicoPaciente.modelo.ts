import { PacientesComponent } from '../vistas/listas/pacientes/pacientes.component';
import { HistorialClinicoModelo } from './historialClinico.modelo';
import { PacienteModelo } from './paciente.modelo';

export class HistorialClinicoPacienteModelo {

    historialClinico : HistorialClinicoModelo = new HistorialClinicoModelo() ;
	paciente: PacienteModelo = new PacienteModelo() ;

    constructor() {
    }

}
