import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CitaModelo } from '../../../modelos/cita.modelo';
import { FuncionarioModelo } from '../../../modelos/funcionario.modelo';
import { PersonaModelo } from '../../../modelos/persona.modelo';
import { AreaModelo } from '../../../modelos/area.modelo';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { CitasService } from '../../../servicios/citas.service';
import { PacientesService } from '../../../servicios/pacientes.service';
import { FuncionariosService } from '../../../servicios/funcionarios.service';
import { AreasService } from '../../../servicios/areas.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { PacienteModelo } from 'src/app/modelos/paciente.modelo';
import { ParametroModelo } from 'src/app/modelos/parametro.modelo';
import { ParametrosService } from 'src/app/servicios/parametros.service';
import { TokenService } from 'src/app/servicios/token.service';
import { GlobalConstants } from 'src/app/common/global-constants';
import { UsuariosService } from 'src/app/servicios/usuarios.service';
@Component({
  selector: 'app-cita',
  templateUrl: './cita.component.html',
  styleUrls: ['./cita.component.css']
})
export class CitaComponent implements OnInit {
  crear = false;
  cita: CitaModelo = new CitaModelo();
  pacientePersona: PersonaModelo = new PersonaModelo();  
  funcionarioPersona: PersonaModelo = new PersonaModelo();
  buscadorPacientesForm: FormGroup;
  paciente: PacienteModelo = new PacienteModelo();
  funcionario: FuncionarioModelo = new FuncionarioModelo();
  listaAreas: AreaModelo;
  listaEstados: ParametroModelo;
  citaForm: FormGroup;
  modificar: boolean = false;
  pacientes: PacienteModelo[] = [];
  funcionarios: FuncionarioModelo[] = [];
  alert:boolean=false;
  alertGuardar:boolean=false;
  dtOptions: any = {};
  cargando = false;
  historialClinicoForm: FormGroup;
  buscadorFuncionariosForm: FormGroup;
  loadBuscadorPacientes = false;
  loadBuscadorFuncionarios = false;

  constructor( private tokenService: TokenService,
               private citasService: CitasService,
               private pacientesService: PacientesService,
               private parametrosService: ParametrosService,
               private funcionariosService: FuncionariosService,
               private areasService: AreasService,
               private route: ActivatedRoute,
               private comunes: ComunesService,
               private router: Router,
               private fb: FormBuilder,
               private fb2: FormBuilder,
               private fb3: FormBuilder,
               private modalService: NgbModal,
               private usuariosService : UsuariosService ) { 
    this.crearFormulario();
  }

  ngOnInit() {
    this.obtenerParametros();
    this.listarAreas();

    const valorRuta = this.route.snapshot.paramMap.get('id');
    const rutaArray = valorRuta.split("-");

    const id = rutaArray.length > 0 ? rutaArray[0] : valorRuta;

    if ( id !== 'nuevo' && id !== 'enfermeria' ) {
      this.citasService.getCita( Number(id) )
        .subscribe( (resp: CitaModelo) => {         
          this.citaForm.patchValue(resp);
        });
    }else if( id == 'enfermeria' ){
      this.crear = true;
      this.citaForm.get('estado').setValue('PENDIENTE');
      if( rutaArray != null && rutaArray.length > 1 ){
        this.citaForm.get('pacientes').get('pacienteId').setValue(rutaArray[1]);

        this.obtenerPaciente(null);
        
      } 
    }else{
      this.crear = true;
      this.citaForm.get('estado').setValue('PENDIENTE');
    }
  }  

  obtenerParametros() {
    var estadoCivilParam = new ParametroModelo();
    estadoCivilParam.codigoParametro = "ESTADO_CITA";
    estadoCivilParam.estado = "A";
    var orderBy = "descripcionValor";
    var orderDir = "asc";

    this.parametrosService.buscarParametrosFiltrosOrder( estadoCivilParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo) => {
        this.listaEstados = resp;
    });
  }

  obtenerPaciente(event){
    if( event != null) event.preventDefault();
    var id = this.citaForm.get('pacientes').get('pacienteId').value;
    if(!id){
      return null;
    }
    this.pacientesService.getPaciente( id )
      .subscribe( (resp: PacienteModelo) => {         
        this.citaForm.get('pacientes').patchValue(resp);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
        }
      );
  }

  obtenerFuncionario(event){
    event.preventDefault();
    var id = this.citaForm.get('funcionarios').get('funcionarioId').value;
    if(!id){
      return null;
    }
    this.funcionariosService.getFuncionario( id )
      .subscribe( (resp: FuncionarioModelo) => {          
        this.citaForm.get('funcionarios').patchValue(resp);
      }, e => {
          Swal.fire({
            icon: 'info',
            //title: 'Algo salió mal',
            text: this.comunes.obtenerError(e)
          })
        }
      );
  }

  listarAreas() {
    var orderBy = "descripcion";
    var orderDir = "asc";
    var area = new AreaModelo();
    area.estado = "A";
    area.tipo = "SERVICIO,CONSULTORIO";

    this.areasService.buscarAreasFiltrosOrder(area, orderBy, orderDir )
      .subscribe( (resp: AreaModelo) => {
        this.listaAreas = resp;
    });
  }
  
  guardar( ) {
    this.cerrarAlertGuardar();
    if ( this.citaForm.invalid ){
      this.alertGuardar = true;
      return Object.values( this.citaForm.controls ).forEach( control => {
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }

    Swal.fire({
      title: 'Espere',
      text: 'Guardando información',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    let peticion: Observable<any>;

    this.cita = this.citaForm.getRawValue();

    if ( this.cita.citaId ) {
      this.cita.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.citasService.actualizarCita( this.cita );
    } else {
      this.cita.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.citasService.crearCita( this.cita );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: this.cita.citaId ? this.cita.citaId.toString() : '',
                text: resp.mensaje
              }).then( resp => {

        if ( resp.value ) {
          if ( !this.crear ) {
            this.router.navigate(['/inicio/citas']);
          }else{
            this.limpiar();
          }
        }
      });
    }, e => {
            Swal.fire({
              icon: 'error',
              title: 'Algo salió mal',
              text: this.comunes.obtenerError(e)
            })          
       }
    );
  }

  limpiar(){
    this.citaForm.reset();
    this.cita = new CitaModelo();
    this.paciente = new PacienteModelo();
    this.funcionario = new FuncionarioModelo();
    this.citaForm.get('estado').setValue('A');
  }

  obtenerError(e : any){
    var mensaje = "Error indefinido ";
      if(e.error.mensaje){
        mensaje = e.error.mensaje;
      }
      if(e.error.message){
        mensaje = e.error.message;
      }
      if(e.error.errors){
        mensaje = mensaje + ' ' + e.error.errors[0];
      }
      if(e.error.error){
        mensaje = mensaje + ' ' + e.error.error;
      }
    return mensaje;  
  }

  get areaNoValido() {
    return this.citaForm.get('areas').get('areaId').invalid 
    && this.citaForm.get('areas').get('areaId').touched
  }
  get pacienteIdNoValido() {
    return this.citaForm.get('pacientes').get('pacienteId').invalid 
    && this.citaForm.get('pacientes').get('pacienteId').touched
  }
  get funcionarioIdNoValido() {
    return this.citaForm.get('funcionarios').get('funcionarioId').invalid 
    && this.citaForm.get('funcionarios').get('funcionarioId').touched
  }
  get fechaNoValido() {
    return this.citaForm.get('fecha').invalid 
    && this.citaForm.get('fecha').touched
  }
  get horaNoValido() {
    return this.citaForm.get('hora').invalid 
    && this.citaForm.get('hora').touched
  }
  
  crearFormulario() {
    this.citaForm = this.fb.group({
      citaId  : [null, [] ],
      pacientes : this.fb.group({
        pacienteId  : [null, [Validators.required] ],
        personas : this.fb.group({
          cedula  : [null, [] ],
          nombres  : [null, [] ],
          apellidos  : [null, [] ]
        })
      }),
      funcionarios : this.fb.group({
        funcionarioId  : [null, [Validators.required] ],
        personas : this.fb.group({
          cedula  : [null, [] ],
          nombres  : [null, [] ],
          apellidos  : [null, [] ]
        })
      }),
      areas : this.fb.group({
        areaId  : [null, [Validators.required] ]        
      }),
      fecha  : [null, [Validators.required] ],
      hora  : [null, [Validators.required] ],
      estado  : [null, [Validators.required] ],
      notas: [null, []],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],             
    });

    this.buscadorPacientesForm = this.fb2.group({
      pacienteId  : ['', [] ],
      cedula  : ['', [] ],
      nombres  : ['', [] ],
      apellidos: ['', [] ]   
    });

    this.buscadorFuncionariosForm = this.fb3.group({
      funcionarioId  : ['', [] ],
      cedula  : ['', [] ],
      nombres  : ['', [] ],
      apellidos: ['', [] ]   
    });

    this.citaForm.get('citaId').disable();
    this.citaForm.get('pacientes').get('personas').get('cedula').disable();
    this.citaForm.get('pacientes').get('personas').get('nombres').disable();
    this.citaForm.get('pacientes').get('personas').get('apellidos').disable();

    this.citaForm.get('funcionarios').get('personas').get('cedula').disable();
    this.citaForm.get('funcionarios').get('personas').get('nombres').disable();
    this.citaForm.get('funcionarios').get('personas').get('apellidos').disable();

    this.citaForm.get('fechaCreacion').disable();
    this.citaForm.get('fechaModificacion').disable();
    this.citaForm.get('usuarioCreacion').disable();
    this.citaForm.get('usuarioModificacion').disable();
  }

  buscadorPacientes(event) {
    event.preventDefault();
    
    var persona: PersonaModelo = new PersonaModelo();
    var buscadorPaciente: PacienteModelo = new PacienteModelo();

    persona.cedula = this.buscadorPacientesForm.get('cedula').value;
    persona.nombres = this.buscadorPacientesForm.get('nombres').value;
    persona.apellidos = this.buscadorPacientesForm.get('apellidos').value;
    buscadorPaciente.personas = persona;

    if(!buscadorPaciente.personas.cedula 
      && !buscadorPaciente.personas.nombres && !buscadorPaciente.personas.apellidos){
      this.alert=true;
      return;
    }

    this.loadBuscadorPacientes = true;
    this.pacientesService.buscarPacientesFiltrosTabla(buscadorPaciente)
    .subscribe( resp => {
      this.loadBuscadorPacientes = false;
      this.pacientes = resp;
    }, e => {
      this.loadBuscadorPacientes = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      //this.cargando = false;
    });
  }

  buscadorFuncionarios(event) {
    event.preventDefault();
    var persona: PersonaModelo = new PersonaModelo();
    var buscador: FuncionarioModelo = new FuncionarioModelo();

    persona.cedula = this.buscadorFuncionariosForm.get('cedula').value;
    persona.nombres = this.buscadorFuncionariosForm.get('nombres').value;
    persona.apellidos = this.buscadorFuncionariosForm.get('apellidos').value;
    buscador.personas = persona;
    buscador.funcionarioId = this.buscadorFuncionariosForm.get('funcionarioId').value;    

    this.loadBuscadorFuncionarios = true;
    this.funcionariosService.buscarFuncionariosFiltrosTabla(buscador)
    .subscribe( resp => {
      this.loadBuscadorFuncionarios = false;
      this.funcionarios = resp;
    }, e => {
      this.loadBuscadorFuncionarios = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      //this.cargando = false;
    });
  }

  limpiarModalPacientes(event) {
    event.preventDefault();
    this.buscadorPacientesForm.reset();
    this.pacientes = [];
  }

  limpiarModalFuncionarios(event) {
    event.preventDefault();
    this.buscadorFuncionariosForm.reset();
    this.funcionarios = [];
  }

  cerrarAlert(){
    this.alert=false;
  }

  crearTablaModelPacientes(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      language: {
        "lengthMenu": "Mostrar _MENU_ registros",
        "zeroRecords": "No se encontraron resultados",
        "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sSearch": "Buscar:",
        "oPaginate": {
          "sFirst": "Primero",
          "sLast":"Último",
          "sNext":"Siguiente",
          "sPrevious": "Anterior"
        },
        "sProcessing":"Procesando...",
      },     
      searching: false,
      processing: true,
      columns: [ { data: 'pacienteId' }, { data: 'cedula' }, 
      { data: 'nombres' }, { data: 'apellidos' }]      
    };
  }

  crearTablaModelFuncionarios(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      language: {
        "lengthMenu": "Mostrar _MENU_ registros",
        "zeroRecords": "No se encontraron resultados",
        "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "infoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sSearch": "Buscar:",
        "oPaginate": {
          "sFirst": "Primero",
          "sLast":"Último",
          "sNext":"Siguiente",
          "sPrevious": "Anterior"
        },
        "sProcessing":"Procesando...",
      },     
      searching: false,
      processing: true,
      columns: [ { data: 'funcionarioId' }, { data: 'cedula' }, 
      { data: 'nombres' }, { data: 'apellidos' }]      
    };
  }

  openModalPacientes(targetModal) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
   
    this.buscadorPacientesForm.patchValue({
      pacienteId: '',
      cedula: '',
      nombres: '',
      apellidos: ''
    });
    this.pacientes = [];
    this.alert=false;
  }

  openModalFuncionarios(targetModal) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
   
    this.buscadorFuncionariosForm.patchValue({
      funcionarioId: '',
      cedula: '',
      nombres: '',
      apellidos: ''
    });
    this.funcionarios = [];
    this.alert=false;
  }

  selectPaciente(event, paciente: PacienteModelo){
    this.modalService.dismissAll();
    if(paciente.pacienteId){
      this.citaForm.get('pacientes').get('pacienteId').setValue(paciente.pacienteId);
    }
    this.pacientesService.getPaciente( paciente.pacienteId )
      .subscribe( (resp: PacienteModelo) => {         
        this.citaForm.get('pacientes').patchValue(resp);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
          this.citaForm.get('pacientes').get('pacienteId').setValue(null);
        }
      );
  }

  selectFuncionario( funcionario: FuncionarioModelo){
    this.modalService.dismissAll();
    if(funcionario.funcionarioId){
      this.citaForm.get('funcionarios').get('funcionarioId').setValue(funcionario.funcionarioId);
    }
    this.funcionariosService.getFuncionario( funcionario.funcionarioId )
      .subscribe( (resp: FuncionarioModelo) => {         
        this.citaForm.get('funcionarios').patchValue(resp);
        if( GlobalConstants.INACTIVO == resp.estado ){
          Swal.fire({
            icon: 'info',
            title: 'Atención',
            text: 'El funcionario se encuentra inactivo'
          })
        }
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
          this.citaForm.get('funcionarios').get('funcionarioId').setValue(null);
        }
      );
  }

  onSubmit() {
    this.modalService.dismissAll();
  }

  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
