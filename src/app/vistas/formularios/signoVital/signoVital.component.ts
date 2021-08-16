import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { SignoVitalModelo } from '../../../modelos/signoVital.modelo';
import { FuncionarioModelo } from '../../../modelos/funcionario.modelo';
import { PersonaModelo } from '../../../modelos/persona.modelo';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { SignosVitalesService } from '../../../servicios/signosVitales.service';
import { PacientesService } from '../../../servicios/pacientes.service';
import { FuncionariosService } from '../../../servicios/funcionarios.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { PacienteModelo } from 'src/app/modelos/paciente.modelo';
import { StockModelo } from 'src/app/modelos/stock.modelo';
import { ParametroModelo } from 'src/app/modelos/parametro.modelo';
import { ParametrosService } from 'src/app/servicios/parametros.service';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-signoVital',
  templateUrl: './signoVital.component.html',
  styleUrls: ['./signoVital.component.css']
})
export class SignoVitalComponent implements OnInit {
  crear = false;  
  pacientePersona: PersonaModelo = new PersonaModelo();  
  funcionarioPersona: PersonaModelo = new PersonaModelo();
  pacientes: PacienteModelo[] = [];
  funcionarios: FuncionarioModelo[] = [];
  stocks: StockModelo[] = [];
  paciente: PacienteModelo = new PacienteModelo();
  funcionario: FuncionarioModelo = new FuncionarioModelo();
  buscadorPacientesForm: FormGroup;
  buscadorFuncionariosForm: FormGroup;
  signoVitalForm: FormGroup;
  buscadorStockForm: FormGroup;
  alert:boolean=false;
  alertPacientes:boolean=false;
  alertMedicamentos:boolean=false;
  alertFuncionarios:boolean=false;
  alertGuardar:boolean=false;
  dtOptions: any = {};
  modificar: boolean = false;
  cargando = false;
  loadBuscadorPacientes = false;
  loadBuscadorFuncionarios = false;

  constructor( private tokenService: TokenService,
               private signoVitalService: SignosVitalesService,
               private pacientesService: PacientesService,
               private funcionariosService: FuncionariosService,
               private router: Router,
               private comunes: ComunesService,
               private route: ActivatedRoute,
               private fb: FormBuilder,
               private fb2: FormBuilder,
               private fb3: FormBuilder,
               private fb4: FormBuilder,
               private modalService: NgbModal ) { 
    this.crearFormulario();
  }

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');

    if ( id !== 'nuevo' ) {
      this.signoVitalService.getSignoVital( Number(id) )
        .subscribe( (resp: SignoVitalModelo) => {         
          this.signoVitalForm.patchValue(resp);
        });
    }else{
      this.crear = true;
      //this.signoVitalForm.get('fecha').setValue(new Date().toDateString());
    }
  }  

  obtenerPaciente(event ){
    event.preventDefault();
    var id = this.signoVitalForm.get('pacientes').get('pacienteId').value;
    if(!id){
      return null;
    }
    this.pacientesService.getPaciente( id )
        .subscribe( (resp: PacienteModelo) => {         
          this.signoVitalForm.get('pacientes').patchValue(resp);
        }, e => {
            Swal.fire({
              icon: 'info',
              text: e.status +'. '+ this.comunes.obtenerError(e),
            })
          }
        );
  }

  obtenerFuncionario(event ){
    event.preventDefault();
    var id = this.signoVitalForm.get('funcionarios').get('funcionarioId').value;
    if(!id){
      return null;
    }
    this.funcionariosService.getFuncionario( id )
      .subscribe( (resp: FuncionarioModelo) => {          
        this.signoVitalForm.get('funcionarios').patchValue(resp);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: e.status +'. '+ this.comunes.obtenerError(e),
          })
        }
      );
  }
 
  
  guardar( ) {

    if ( this.signoVitalForm.invalid ){
      this.alertGuardar = true;
      return Object.values( this.signoVitalForm.controls ).forEach( control => {
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
    var signoVital: SignoVitalModelo = new SignoVitalModelo();

    signoVital = this.signoVitalForm.getRawValue();
  
    if ( signoVital.signoVitalId ) {
      signoVital.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.signoVitalService.actualizarSignoVital( signoVital );
    } else {
      signoVital.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.signoVitalService.crearSignoVital( signoVital );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: signoVital.signoVitalId ? signoVital.signoVitalId.toString() : '',
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( signoVital.signoVitalId ) {
            this.router.navigate(['/signosVitales']);
          }else{
            this.limpiar();
          }
        }
      });
    }, e => {          
        Swal.fire({
          icon: 'error',
          title: 'Algo salió mal',
          text: e.status +'. '+ this.comunes.obtenerError(e),
        })          
      }
    );
  }

  limpiar(){
    this.signoVitalForm.reset();
    this.paciente = new PacienteModelo();
    this.funcionario = new FuncionarioModelo();
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
  
  get fechaNoValido() {
    return this.signoVitalForm.get('fecha').invalid && this.signoVitalForm.get('fecha').touched
  }
  get pacienteIdNoValido() {
    return this.signoVitalForm.get('pacientes').get('pacienteId').invalid && this.signoVitalForm.get('pacientes').get('pacienteId').touched
  }
  get funcionarioIdNoValido() {
    return this.signoVitalForm.get('funcionarios').get('funcionarioId').invalid && this.signoVitalForm.get('funcionarios').get('funcionarioId').touched
  }

  crearFormulario() {
    this.signoVitalForm = this.fb.group({
      signoVitalId  : [null, [] ],
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
      fecha  : [null, [Validators.required] ],
      notas  : [null, [] ],
      pulso : [null, [] ],
      frecuenciaCardiaca  : [null, [] ],
      frecuenciaRespiratoria  : [null, [] ],
      presionSistolica  : [null, [] ],
      presionDiastolica  : [null, [] ],
      temperatura  : [null, [] ],
      peso  : [null, [] ],
      talla  : [null, [] ],
      indiceMasaCorporal: [null, [] ],
      ciaAbdominal: [null, [] ],
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

    this.buscadorStockForm = this.fb4.group({
      insumoId  : [null, [] ],
      codigo  : [null, [] ],
      descripcion  : [null, [] ],
      fechaVencimiento: [null, [] ]
    });

    this.signoVitalForm.get('signoVitalId').disable();
    this.signoVitalForm.get('pacientes').get('personas').get('cedula').disable();
    this.signoVitalForm.get('pacientes').get('personas').get('nombres').disable();
    this.signoVitalForm.get('pacientes').get('personas').get('apellidos').disable();

    this.signoVitalForm.get('funcionarios').get('personas').get('cedula').disable();
    this.signoVitalForm.get('funcionarios').get('personas').get('nombres').disable();
    this.signoVitalForm.get('funcionarios').get('personas').get('apellidos').disable();

    this.signoVitalForm.get('fechaCreacion').disable();
    this.signoVitalForm.get('fechaModificacion').disable();
    this.signoVitalForm.get('usuarioCreacion').disable();
    this.signoVitalForm.get('usuarioModificacion').disable();
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
        text: e.status +'. '+ this.comunes.obtenerError(e)
      })
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
        text: e.status +'. '+ this.comunes.obtenerError(e)
      })
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
  cerrarAlertPaciente(){
    this.alertPacientes=false;
  }
  cerrarAlertFuncionarios(){
    this.alertFuncionarios=false;
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
      this.signoVitalForm.get('pacientes').get('pacienteId').setValue(paciente.pacienteId);
    }
    this.pacientesService.getPaciente( paciente.pacienteId )
      .subscribe( (resp: PacienteModelo) => {         
        this.signoVitalForm.get('pacientes').patchValue(resp);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: e.status +'. '+ this.comunes.obtenerError(e)
          })
          this.signoVitalForm.get('pacientes').get('pacienteId').setValue(null);
        }
      );
  }

  selectFuncionario(event, funcionario: FuncionarioModelo){
    this.modalService.dismissAll();
    if(funcionario.funcionarioId){
      this.signoVitalForm.get('funcionarios').get('funcionarioId').setValue(funcionario.funcionarioId);
    }
    this.funcionariosService.getFuncionario( funcionario.funcionarioId )
      .subscribe( (resp: FuncionarioModelo) => {         
        this.signoVitalForm.get('funcionarios').patchValue(resp);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: e.status +'. '+ this.comunes.obtenerError(e)
          })
          this.signoVitalForm.get('funcionarios').get('funcionarioId').setValue(null);
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
