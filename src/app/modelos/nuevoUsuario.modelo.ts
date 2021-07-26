import { PersonaModelo } from './persona.modelo';
import { FuncionarioModelo } from './funcionario.modelo';
import { Usuario2Modelo } from './usuario2.modelo';
import { RolModelo } from './rol.modelo';

export class nuevoUsuarioModelo {

    usuario : Usuario2Modelo
    roles : Set<string>;
    rolesList : RolModelo [];
    esCambioContrasenha : boolean

    constructor() {
    }

}
