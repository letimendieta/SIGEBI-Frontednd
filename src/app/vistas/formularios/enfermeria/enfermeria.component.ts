import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ParametroModelo } from '../../../modelos/parametro.modelo';
import { CarreraModelo } from '../../../modelos/carrera.modelo';
import { DepartamentoModelo } from '../../../modelos/departamento.modelo';
import { DependenciaModelo } from '../../../modelos/dependencia.modelo';
import { EstamentoModelo } from '../../../modelos/estamento.modelo';
import { CarrerasService } from '../../../servicios/carreras.service';
import { DepartamentosService } from '../../../servicios/departamentos.service';
import { DependenciasService } from '../../../servicios/dependencias.service';
import { EstamentosService } from '../../../servicios/estamentos.service';
import { ParametrosService } from '../../../servicios/parametros.service';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { PacienteModelo } from '../../../modelos/paciente.modelo';
import { PatologiaProcedimientoModelo } from '../../../modelos/patologiaProcedimiento.modelo';
import { PacientesService } from '../../../servicios/pacientes.service';
import { HistorialesClinicosService } from '../../../servicios/historialesClinicos.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PersonaModelo } from 'src/app/modelos/persona.modelo';
import { AntecedenteModelo } from 'src/app/modelos/antecedente.modelo';
import { AlergiaModelo } from 'src/app/modelos/alergia.modelo';
import { HistorialClinicoModelo } from 'src/app/modelos/historialClinico.modelo';


@Component({
  selector: 'app-enfermeria',
  templateUrl: './enfermeria.component.html',
  styleUrls: ['./enfermeria.component.css']
})
export class EnfermeriaComponent implements OnInit {
  
  crear = false;
  personaForm: FormGroup;
  pacienteForm: FormGroup;
  buscadorForm: FormGroup;
  historialClinicoForm: FormGroup;
  buscadorModalForm: FormGroup;
  pacientes: PacienteModelo[] = [];
  patologiasProcedimientos: PatologiaProcedimientoModelo[] = [];
  antecedentes: AntecedenteModelo[] = [];
  alergias: AlergiaModelo[] = [];
  paciente: PacienteModelo = new PacienteModelo();
  listaEstadoCivil: ParametroModelo;
  listaSexo: ParametroModelo;
  listaNacionalidad: ParametroModelo;
  listaCarreras: CarreraModelo;
  listaDepartamentos: DepartamentoModelo;
  listaDependencias: DependenciaModelo;
  listaEstamentos: EstamentoModelo;
  cargando = false;
  alert:boolean=false;
  dtOptions: any = {};
  dtOptionsPatologias: any = {};  
  dtOptionsAntecedentes: any = {};
  dtOptionsAlergias: any = {};

  constructor( private historialClinicosService: HistorialesClinicosService,
               private route: ActivatedRoute,
               private parametrosService: ParametrosService,
               private carrerasService: CarrerasService,
               private departamentosService: DepartamentosService,
               private comunes: ComunesService,
               private dependenciasService: DependenciasService,
               private estamentosService: EstamentosService,
               private pacientesService: PacientesService,
               private router: Router,
               private modalService: NgbModal,
               private fb: FormBuilder,
               private fb2: FormBuilder,
               private fb3: FormBuilder) { 
    this.crearFormulario();
  }              

  ngOnInit() {
    this.obtenerParametros();
    this.crearTablaPatologias();
    this.listarCarreras();
    this.listarDepartamentos();
    this.listarDependencias();
    this.listarEstamentos();
  }  


  obtenerParametros() {
    var estadoCivilParam = new ParametroModelo();
    estadoCivilParam.codigoParametro = "EST_CIVIL";
    estadoCivilParam.estado = "A";
    var orderBy = "descripcionValor";
    var orderDir = "asc";

    this.parametrosService.buscarParametrosFiltros( estadoCivilParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo) => {
        this.listaEstadoCivil = resp;
    });

    var sexoParam = new ParametroModelo();
    sexoParam.codigoParametro = "SEXO";
    sexoParam.estado = "A";

    this.parametrosService.buscarParametrosFiltros( sexoParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo) => {
        this.listaSexo = resp;
    });

    var nacionalidadParam = new ParametroModelo();
    nacionalidadParam.codigoParametro = "NACIONALIDAD";
    nacionalidadParam.estado = "A";

    this.parametrosService.buscarParametrosFiltros( nacionalidadParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo) => {
        this.listaNacionalidad = resp;
    });
    
  }

  listarCarreras() {
    var orderBy = "descripcion";
    var orderDir = "asc";

    this.carrerasService.buscarCarrerasFiltros(null, orderBy, orderDir )
      .subscribe( (resp: CarreraModelo) => {
        this.listaCarreras = resp;
    });
  }

  listarDepartamentos() {
    var orderBy = "descripcion";
    var orderDir = "asc";

    this.departamentosService.buscarDepartamentosFiltros(null, orderBy, orderDir )
      .subscribe( (resp: DepartamentoModelo) => {
        this.listaDepartamentos = resp;
    });
  }

  listarDependencias() {
    var orderBy = "descripcion";
    var orderDir = "asc";

    this.dependenciasService.buscarDependenciasFiltros(null, orderBy, orderDir )
      .subscribe( (resp: DependenciaModelo) => {
        this.listaDependencias = resp;
    });
  }

  listarEstamentos() {
    var orderBy = "descripcion";
    var orderDir = "asc";

    this.estamentosService.buscarEstamentosFiltros(null, orderBy, orderDir )
      .subscribe( (resp: EstamentoModelo) => {
        this.listaEstamentos = resp;
    });
  }

  buscarPaciente(event) {
    event.preventDefault();    
    var paciente = new PacienteModelo();
    var persona = new PersonaModelo();
    persona.cedula = this.buscadorForm.get('cedulaBusqueda').value;
    paciente.personas = persona;
    paciente.pacienteId = this.buscadorForm.get('pacienteIdBusqueda').value;
    this.limpiar(event);
    this.pacientesService.buscarPacientesFiltros(paciente)
    .subscribe( resp => {   
      if(resp.length <= 0){
        Swal.fire({
          icon: 'info',
          title: 'No se encontro paciente',
          text: 'No se encontro paciente'
        })
      }else{
        this.pacienteForm.patchValue(resp[0]);
        this.buscadorForm.get('pacienteIdBusqueda').setValue(resp[0].pacienteId);
        this.buscadorForm.get('cedulaBusqueda').setValue(resp[0].personas.cedula);
        this.obtenerHistorialClinico();
      }
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: e.status +'. '+ this.comunes.obtenerError(e)
      })
      //this.cargando = false;
    });



    /*this.pacientesService.buscarPacientesFiltros( Number(id) )
        .subscribe( (resp: PacienteModelo) => {  
          this.pacienteForm.patchValue(resp);
          var cedula = this.pacienteForm.get('personas').get('cedula').value;
          this.fileInfos = this.uploadService.getFilesName(cedula + '_', "I");
        });*/
  }

  obtenerHistorialClinico() {   
    var paciente = new PacienteModelo();
    var pacientePersona = new PersonaModelo();
    var buscador = new HistorialClinicoModelo();

    pacientePersona.cedula = this.buscadorForm.get('cedulaBusqueda').value;
    if(!pacientePersona.cedula){
      paciente.personas = null;
    }else{
      paciente.personas = pacientePersona;
    }
    paciente.pacienteId = this.buscadorForm.get('pacienteIdBusqueda').value;
    if(paciente.personas == null && !paciente.pacienteId){
      paciente = null;
    }      
 
    //buscador.pacientes = this.paciente;

    this.historialClinicosService.buscarHistorialClinicosFiltros(buscador)
    .subscribe( resp => {     

      if(resp.length <= 0){
        Swal.fire({
          icon: 'info',
          title: 'No se encontro paciente',
          text: 'No se encontro paciente'
        })
      }else{
        this.historialClinicoForm.patchValue(resp[0]);
        //this.buscadorForm.get('pacienteIdBusqueda').setValue(resp[0].pacienteId);
        //this.buscadorForm.get('cedulaBusqueda').setValue(resp[0].personas.cedula);
      }
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: e.status +'. '+ this.comunes.obtenerError(e)
      })
      this.cargando = false;
    });
  }

  crearFormulario() {
    this.pacienteForm = this.fb.group({
      pacienteId  : [null, [] ],
      personas : this.fb.group({
        personaId  : [null, [] ],
        cedula  : [null, [] ],
        nombres  : [null, [] ],
        apellidos: [null, [] ],
        fechaNacimiento: [null, [] ],
        edad: [null, [] ],
        direccion: [null, [] ],
        sexo: [null, [] ],
        estadoCivil: [null, [] ],
        nacionalidad: [null, [] ],
        telefono: [null, [] ],
        email  : [null, [] ],
        celular: [null, [] ],
        carreraId: [null, [] ],
        departamentoId: [null, [] ],
        dependenciaId: [null, [] ],
        estamentoId: [null, [] ], 
        fechaCreacion: [null, [] ],
        fechaModificacion: [null, [] ],
        usuarioCreacion: [null, [] ],
        usuarioModificacion: [null, [] ]   
      }),
      grupoSanguineo  : [null, [] ],
      seguroMedico  : [null, [] ]        
    });

    this.historialClinicoForm = this.fb.group({
      historialClinicoId  : [null, [] ],
      pacientes : this.fb.group({
        pacienteId  : [null, [] ],
        personas : this.fb.group({
          cedula  : [null, [] ],
          nombres  : [null, [] ],
          apellidos  : [null, [] ]
        })
      }),      
      areaId  : [null, [Validators.required] ],     
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],             
    });
    
    this.buscadorModalForm = this.fb2.group({
      cedula  : ['', [] ],
      nombres  : ['', [] ],
      apellidos: ['', [] ]   
    });

    this.buscadorForm = this.fb3.group({
      pacienteIdBusqueda  : ['', [] ],
      cedulaBusqueda  : ['', [] ]
    });

    //this.pacienteForm.get('pacienteId').disable();
  }

  crearTablaModel(){
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

  crearTablaPatologias(){
    this.dtOptionsPatologias = {
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
        "sLengthMenu":     "Mostrar _MENU_ registros",
        "sEmptyTable":     "Ningún dato disponible en esta tabla",
        "sLoadingRecords": "Cargando..."
      },
      processing: true,
      columns: [
        {data:'#'},
        {data:'patologiaId'}, {data:'codigo'}, {data:'descripcion'},
        {data:'estado'},
        {data:'Editar'}
      ]
    };
  }

  crearTablaAntecedentes(){
    this.dtOptionsAntecedentes = {
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
        "sLengthMenu":     "Mostrar _MENU_ registros",
        "sEmptyTable":     "Ningún dato disponible en esta tabla",
        "sLoadingRecords": "Cargando..."
      },
      processing: true,
      columns: [
        {data:'#'},
        {data:'patologiaId'}, {data:'codigo'}, {data:'descripcion'},
        {data:'estado'},
        {data:'Editar'}
      ]
    };
  }

  crearTablaAlergias(){
    this.dtOptionsAlergias = {
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
        "sLengthMenu":     "Mostrar _MENU_ registros",
        "sEmptyTable":     "Ningún dato disponible en esta tabla",
        "sLoadingRecords": "Cargando..."
      },
      processing: true,
      columns: [
        {data:'#'},
        {data:'patologiaId'}, {data:'codigo'}, {data:'descripcion'},
        {data:'estado'},
        {data:'Editar'}
      ]
    };
  }

  buscadorPacientes(event) {
    event.preventDefault();
    
    var persona: PersonaModelo = new PersonaModelo();
    var buscadorPaciente: PacienteModelo = new PacienteModelo();

    persona.cedula = this.buscadorModalForm.get('cedula').value;
    persona.nombres = this.buscadorModalForm.get('nombres').value;
    persona.apellidos = this.buscadorModalForm.get('apellidos').value;
    buscadorPaciente.personas = persona;

    if(!buscadorPaciente.personas.cedula 
      && !buscadorPaciente.personas.nombres && !buscadorPaciente.personas.apellidos){
      this.alert=true;
      return;
    }
    this.cargando = true;
    this.pacientesService.buscarPacientesFiltros(buscadorPaciente)
    .subscribe( resp => {
      this.pacientes = resp;
      this.cargando = false;
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: e.status +'. '+ this.comunes.obtenerError(e)
      })
      this.cargando = false;
    });
  }

  limpiarModal(event) {
    event.preventDefault();
    this.buscadorModalForm.reset();
  }

  limpiar(event){
    event.preventDefault();
    this.pacienteForm.reset();
    this.historialClinicoForm.reset();
    this.buscadorForm.reset();
  }

  cerrarAlert(){
    this.alert=false;
  }

  openModal(targetModal) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
   
    this.buscadorModalForm.patchValue({
      pacienteId: '',
      cedula: '',
      nombres: '',
      apellidos: ''
    });
    this.pacientes = [];
    this.alert=false;
  }

  selectPaciente(event, paciente: PacienteModelo){
    this.modalService.dismissAll();
    if(paciente.pacienteId){
      this.buscadorForm.get('pacienteIdBusqueda').setValue(paciente.pacienteId);
    }
    this.pacientesService.getPaciente( paciente.pacienteId )
      .subscribe( (resp: PacienteModelo) => {         
        this.pacienteForm.patchValue(resp);
        this.buscadorForm.get('cedulaBusqueda').setValue(resp.personas.cedula);
        this.buscadorForm.get('pacienteIdBusqueda').setValue(resp.pacienteId);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: e.status +'. '+ this.comunes.obtenerError(e)
          })
          this.buscadorForm.get('pacienteIdBusqueda').setValue(null);
        }
      );
  }

  onSubmit() {
    this.modalService.dismissAll();
   }

}
