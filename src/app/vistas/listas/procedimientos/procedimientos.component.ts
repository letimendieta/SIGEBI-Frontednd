import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ProcedimientosService } from '../../../servicios/procedimientos.service';
import { ProcedimientoModelo } from '../../../modelos/procedimiento.modelo';
import { PersonaModelo } from '../../../modelos/persona.modelo';
import { PacienteModelo } from '../../../modelos/paciente.modelo';
import { FuncionarioModelo } from '../../../modelos/funcionario.modelo';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../../common/global-constants';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PacientesService } from 'src/app/servicios/pacientes.service';
import { FuncionariosService } from 'src/app/servicios/funcionarios.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-procedimientos',
  templateUrl: './procedimientos.component.html',
  styleUrls: ['./procedimientos.component.css']
})
export class ProcedimientosComponent implements OnDestroy,  OnInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  dtOptions: any = {};
  dtOptionsBuscadorPacientes: any = {};
  dtOptionsBuscadorFuncionarios: any = {};
  dtTrigger : Subject<any> = new Subject<any>();
  pacientes: PacienteModelo[] = [];
  funcionarios: FuncionarioModelo[] = [];
  procedimientos: ProcedimientoModelo[] = [];
  paciente : PacienteModelo = new PacienteModelo();
  pacientePersona: PersonaModelo = new PersonaModelo();
  funcionario: FuncionarioModelo = new FuncionarioModelo();
  funcionarioPersona: PersonaModelo = new PersonaModelo();
  procedimientoForm: FormGroup;
  buscadorPacientesForm: FormGroup;
  buscadorFuncionariosForm: FormGroup;
  buscadorForm: FormGroup;
  buscador: ProcedimientoModelo = new ProcedimientoModelo();
  cargando = false;
  alert:boolean=false;
  loadBuscadorPacientes = false;
  loadBuscadorFuncionarios = false;

  constructor( private procedimientosService: ProcedimientosService,
              private pacientesService: PacientesService,
              private funcionariosService: FuncionariosService,
              public router: Router,
              private comunes: ComunesService,
              private fb: FormBuilder,
              private fb2: FormBuilder,
              private fb3: FormBuilder,
              private modalService: NgbModal ) {    
  }

  ngOnInit() {
    this.crearFormulario();
    this.crearTabla();
  }

  crearTabla(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      searching: false,
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
      processing: true,
      columns: [
        {data:'#'},
        {data:'procedimientoId'}, {data:'pacientes.pacienteId'}, 
        {data:'pacientes.personas.cedula'},
        {data:'pacientes.personas.nombres'}, {data:'pacientes.personas.apellidos'}, 
        {data:'funcionarios.funcionarioId'},
        {data:'funcionarios.personas.cedula'}, {data:'funcionarios.personas.nombres'},
        {data:'funcionarios.personas.apellidos'},{data:'cantidadInsumo'},
        {data:'estado'},{data:'fecha'},
        {data:'Editar'}//,
        //{data:'Borrar'}
      ],
      dom: 'lBfrtip',
      buttons: [
        {
          extend:    'copy',
          text:      '<i class="far fa-copy"></i>',
          titleAttr: 'Copiar',
          className: 'btn btn-light',
          title:     'Listado de procedimientos',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          },
        },
        {
          extend:    'csv',
          title:     'Listado de procedimientos',
          text:      '<i class="fas fa-file-csv"></i>',
          titleAttr: 'Exportar a CSV',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          },
        },
        {
          extend:    'excelHtml5',
          title:     'Listado de procedimientos',
          text:      '<i class="fas fa-file-excel"></i> ',
          titleAttr: 'Exportar a Excel',
          className: 'btn btn-light',
          autoFilter: true,
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          }
        },          
        {
          extend:    'print',
          title:     'Listado de procedimientos',
          text:      '<i class="fa fa-print"></i> ',
          titleAttr: 'Imprimir',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          },
          customize: function ( win ) {
            $(win.document.body)
                .css( 'font-size', '10pt' )
                .prepend(
                    '<img src= ' + GlobalConstants.imagenReporteListas + ' style="position:absolute; top:400; left:400;" />'
                );

            $(win.document.body).find( 'table' )
                .addClass( 'compact' )
                .css( 'font-size', 'inherit' );
          }              
        }
      ]
    };
  }

  buscadorProcedimientos(event) {   
    event.preventDefault();
    this.cargando = true;
    this.procedimientos = [];
    this.rerender();
    this.paciente = new PacienteModelo();
    this.funcionario = new FuncionarioModelo();
    this.pacientePersona = new PersonaModelo();
    this.funcionarioPersona = new PersonaModelo();

    this.pacientePersona.cedula = this.buscadorForm.get('pacientes').get('pacienteCedula').value;
    this.pacientePersona.nombres = this.buscadorForm.get('pacientes').get('pacienteNombres').value;
    this.pacientePersona.apellidos = this.buscadorForm.get('pacientes').get('pacienteApellidos').value;
    if(!this.pacientePersona.cedula && !this.pacientePersona.nombres && !this.pacientePersona.apellidos){
      this.paciente.personas = null;
    }else{
      this.paciente.personas = this.pacientePersona;
    }
    this.paciente.pacienteId = this.buscadorForm.get('pacientes').get('pacienteId').value; 
    if(this.paciente.personas == null && !this.paciente.pacienteId){
      this.paciente = null;
    }      
    
    this.funcionarioPersona.cedula = this.buscadorForm.get('funcionarios').get('funcionarioCedula').value;
    this.funcionarioPersona.nombres = this.buscadorForm.get('funcionarios').get('funcionarioNombres').value;
    this.funcionarioPersona.apellidos = this.buscadorForm.get('funcionarios').get('funcionarioApellidos').value;

    if(!this.funcionarioPersona.cedula && !this.funcionarioPersona.nombres && !this.funcionarioPersona.apellidos){
      this.funcionario.personas = null;
    }else{
      this.funcionario.personas = this.funcionarioPersona;
    }

    this.funcionario.funcionarioId = this.buscadorForm.get('funcionarios').get('funcionarioId').value;
    if(this.funcionario.personas == null && !this.funcionario.funcionarioId){
      this.funcionario = null;
    } 

    this.buscador.pacientes = this.paciente;
    this.buscador.funcionarios = this.funcionario;

    this.buscador.procedimientoId = this.buscadorForm.get('procedimientoId').value;
    this.buscador.fecha =  this.buscadorForm.get('fecha').value;
    this.procedimientosService.buscarProcedimientosFiltros(this.buscador)
    .subscribe( resp => {      
      this.procedimientos = resp;
      this.dtTrigger.next();
      this.cargando = false;
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      this.cargando = false;
      this.dtTrigger.next();
    });
  }

  limpiar(event) {
    event.preventDefault();
    this.buscadorForm.reset();
    this.buscador = new ProcedimientoModelo();  
    this.procedimientos = [];
    this.rerender();
    this.dtTrigger.next();
  }

  borrarProcedimiento(event, procedimiento: ProcedimientoModelo ) {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea procedimiento id ${ procedimiento.procedimientoId }`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {
        let peticion: Observable<any>;
        peticion = this.procedimientosService.borrarProcedimiento( procedimiento.procedimientoId );

        peticion.subscribe( resp => {
          Swal.fire({
                    icon: 'success',
                    title: procedimiento.procedimientoId.toString(),
                    text: resp.mensaje,
                  }).then( resp => {
            if ( resp.value ) {
              this.ngOnInit();
            }
          });
        }, e => {            
            Swal.fire({
              icon: 'error',
              title: 'Algo salió mal',
              text: this.comunes.obtenerError(e),
            })
          }
        );
      }
    });
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

  crearFormulario() {

    this.buscadorForm = this.fb.group({
      procedimientoId  : ['', [] ],
      fecha : [null, [] ],
      pacientes : this.fb.group({
        pacienteId  : ['', [] ],
        pacienteCedula  : ['', [] ],
        pacienteNombres  : ['', [] ],
        pacienteApellidos  : ['', [] ]        
      }),
      funcionarios : this.fb.group({
        funcionarioId  : ['', [] ],
        funcionarioCedula  : ['', [] ],
        funcionarioNombres  : ['', [] ],
        funcionarioApellidos  : ['', [] ]        
      })      
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
    this.cargando = true;
    this.loadBuscadorPacientes = true;
    this.pacientesService.buscarPacientesFiltros(buscadorPaciente)
    .subscribe( resp => {
      this.loadBuscadorPacientes = false;
      this.pacientes = resp;
      this.cargando = false;
    }, e => {
      this.loadBuscadorPacientes = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      this.cargando = false;
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
    this.funcionariosService.buscarFuncionariosFiltros(buscador)
    .subscribe( resp => {
      this.loadBuscadorFuncionarios = false;
      this.funcionarios = resp;
      this.cargando = false;
    }, e => {
      this.loadBuscadorFuncionarios = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      this.cargando = false;
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
    this.dtOptionsBuscadorPacientes = {
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
    this.dtOptionsBuscadorFuncionarios = {
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
      this.buscadorForm.get('pacientes').get('pacienteId').setValue(paciente.pacienteId);
      this.buscadorForm.get('pacientes').get('pacienteCedula').setValue(paciente.personas.cedula);
    }
  }

  selectFuncionario(event, funcionario: FuncionarioModelo){
    this.modalService.dismissAll();
    if(funcionario.funcionarioId){
      this.buscadorForm.get('funcionarios').get('funcionarioId').setValue(funcionario.funcionarioId);
      this.buscadorForm.get('funcionarios').get('funcionarioCedula').setValue(funcionario.personas.cedula);
    }
  }

  editar(event, id: number) {
    event.preventDefault();
    this.router.navigate(['procedimiento', id]);
  }

  onSubmit() {
    this.modalService.dismissAll();
   }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}
