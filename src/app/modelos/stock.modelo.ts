import { InsumoMedicoModelo } from './insumoMedico.modelo';
import { MedicamentoModelo } from './medicamento.modelo';

export class StockModelo {

    stockId: number;
    cantidad: number;
    notas: string;
    fechaCreacion: Date;
    fechaModificacion: Date;
    usuarioCreacion: string;
    usuarioModificacion: string;
    insumosMedicos: InsumoMedicoModelo;
    medicamentos: MedicamentoModelo;  
    constructor() {
    }

}
