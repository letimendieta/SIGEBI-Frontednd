import { FuncionarioModelo } from './funcionario.modelo';
import { Time } from '@angular/common';

export class HorarioModelo {

    horarioDisponibleId: number;
    fecha: Date;
    dia: string;
    horaInicio: Time;
    horaFin: Time;
    estado: string;
    funcionarios: FuncionarioModelo;
    fechaCreacion: Date;
    fechaModificacion: Date;
    usuarioCreacion: string;
    usuarioModificacion: string;

    constructor() {
    }

}
