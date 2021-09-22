import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ParametroModelo } from '../../../modelos/parametro.modelo';
import { ParametrosService } from '../../../servicios/parametros.service';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { PacienteModelo } from '../../../modelos/paciente.modelo';
import { PatologiaProcedimientoModelo } from '../../../modelos/patologiaProcedimiento.modelo';
import { PacientesService } from '../../../servicios/pacientes.service';
import { AlergiasService } from '../../../servicios/alergias.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PersonaModelo } from 'src/app/modelos/persona.modelo';
import { AntecedenteModelo } from 'src/app/modelos/antecedente.modelo';
import { AlergiaModelo } from 'src/app/modelos/alergia.modelo';
import { StockModelo } from 'src/app/modelos/stock.modelo';
import { Observable } from 'rxjs';
import { ProcesoDiagnosticoTratamientoModelo } from 'src/app/modelos/procesoDiagnosticoTratamiento.modelo';
import { TratamientoInsumoModelo } from 'src/app/modelos/tratamientoInsumo.modelo';
import { ConsultaModelo } from 'src/app/modelos/consulta.modelo';
import { DataTableDirective } from 'angular-datatables';
import { MotivoConsultaModelo } from 'src/app/modelos/motivoConsulta.modelo';
import { SignoVitalModelo } from 'src/app/modelos/signoVital.modelo';
import { FichaMedicaModelo } from 'src/app/modelos/fichaMedica.modelo';
import { AlergenoModelo } from 'src/app/modelos/alergeno.modelo';
import { EnfermedadCie10Modelo } from 'src/app/modelos/enfermedadCie10.modelo';
import { VacunacionModelo } from 'src/app/modelos/vacunacion.modelo';
import { PreguntaModelo } from 'src/app/modelos/pregunta.modelo';
import { PreguntaHistorialModelo } from 'src/app/modelos/preguntaHistorial.modelo';
import { UsuariosService } from 'src/app/servicios/usuarios.service';
import { TokenService } from 'src/app/servicios/token.service';
import { GlobalConstants } from 'src/app/common/global-constants';
import { Usuario2Modelo } from 'src/app/modelos/usuario2.modelo';
import { Router } from '@angular/router';


@Component({
  selector: 'app-enfermeria',
  templateUrl: './enfermeria.component.html',
  styleUrls: ['./enfermeria.component.css']
})

export class EnfermeriaComponent implements OnInit {
  @ViewChild(DataTableDirective, {static: false})  
  dtElement: DataTableDirective;
  crear = false;
  personaForm: FormGroup;
  pacienteForm: FormGroup;
  buscadorForm: FormGroup;
  historialClinicoForm: FormGroup;
  buscadorModalForm: FormGroup;
  stockForm: FormGroup;
  buscadorStockForm: FormGroup;
  buscadorEnfermedadesCie10Form: FormGroup;
  anamnesisForm: FormGroup;
  diagnosticoPrimarioForm: FormGroup;
  diagnosticoSecundarioForm: FormGroup;
  selectFichaMedicaForm: FormGroup;
  planTrabajoForm: FormGroup;
  tratamientoFarmacologicoForm: FormGroup;
  tratamientoNoFarmacologicoForm: FormGroup;
  detalleConsultaForm: FormGroup;
  pacientes: PacienteModelo[] = [];
  vacunaciones: VacunacionModelo[] = [];
  patologiasProcedimientos: PatologiaProcedimientoModelo[] = [];
  antecedentes: AntecedenteModelo[] = [];
  antecedentesFamiliares: AntecedenteModelo[] = [];
  alergias: AlergiaModelo[] = [];
  diagnosticoAlergias: AlergenoModelo[] = [];
  diagnosticoAntecPatolProc: PatologiaProcedimientoModelo[] = [];
  paciente: PacienteModelo = new PacienteModelo();
  listaEstadoCivil: ParametroModelo[] = [];
  listaSexo: ParametroModelo[] = [];
  listaNacionalidad: ParametroModelo[] = [];
  listaMotivosConsulta: MotivoConsultaModelo[] = [];
  listaMedidasMedicamentos: ParametroModelo;
  stocks: StockModelo[] = [];
  consultas: ConsultaModelo[] = new Array();
  enfermedadesCie10: EnfermedadCie10Modelo[] = [];
  enfermedadCie10PrincipalSeleccionada: EnfermedadCie10Modelo = new EnfermedadCie10Modelo();
  enfermedadCie10SecundariaSeleccionada: EnfermedadCie10Modelo = new EnfermedadCie10Modelo();
  tratamientosInsumos: TratamientoInsumoModelo[] = [];
  signosVitales: SignoVitalModelo[] = [];
  fichaMedica: FichaMedicaModelo[] = [];
  preguntas: PreguntaModelo[] = [];
  preguntasHistorial: PreguntaHistorialModelo[] = [];
  preguntasSeleccionadas: PreguntaModelo[] = []; 
  procesoDiagnosticoTratamiento: ProcesoDiagnosticoTratamientoModelo = new ProcesoDiagnosticoTratamientoModelo();
  cargando = false;
  alert:boolean=false;
  guardarBtn = true;
  alertMedicamentos:boolean=false;
  alertGeneral:boolean=false;
  alertGuardar:boolean=false;
  tipoDiagnostico: String = null;
  mensajeGeneral: String = null;
  historialClinicoId: any = null;
  dtOptionsBuscador: any = {};  
  hcid = 0;
  fileInfos: Observable<any>; 
  profile: any = "assets/images/profile.jpg";
  size:any=0;
  nombre:any = "";
  mensajeError: String;
  usuarioActual: Usuario2Modelo;
  rolesUsuario: Array<String> = [];   
  loadBuscadorPacientes = false;

  constructor( 
               private tokenService: TokenService,
               private parametrosService: ParametrosService,
               private comunes: ComunesService,
               private pacientesService: PacientesService,
               private alergiaService: AlergiasService,              
               private modalService: NgbModal,
               private usuariosService: UsuariosService,              
               private fb: FormBuilder,
               private fb3: FormBuilder,
               private fb4: FormBuilder,               
               public router: Router,) { 
    this.crearFormulario();
    this.obtenerUsuarioActual(this.tokenService.getUserName().toString());
    this.ngOnInit();
  }              

  ngOnInit() {
    this.obtenerParametros();   
  }

  obtenerParametros() {
    var estadoCivilParam = new ParametroModelo();
    estadoCivilParam.codigoParametro = "EST_CIVIL";
    estadoCivilParam.estado = "A";
    var orderBy = "descripcionValor";
    var orderDir = "asc";

    this.parametrosService.buscarParametrosFiltros( estadoCivilParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo[]) => {
        this.listaEstadoCivil = resp;
    });

    var sexoParam = new ParametroModelo();
    sexoParam.codigoParametro = "SEXO";
    sexoParam.estado = "A";

    this.parametrosService.buscarParametrosFiltros( sexoParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo[]) => {
        this.listaSexo = resp;
    });

    var nacionalidadParam = new ParametroModelo();
    nacionalidadParam.codigoParametro = "NACIONALIDAD";
    nacionalidadParam.estado = "A";

    this.parametrosService.buscarParametrosFiltros( nacionalidadParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo[]) => {
        this.listaNacionalidad = resp;
    });    

    var unidadMedidaParam = new ParametroModelo();
    unidadMedidaParam.codigoParametro = "UNI_MEDIDA_MEDICAMENTOS";
    unidadMedidaParam.estado = "A";
    var orderBy = "descripcionValor";
    var orderDir = "asc";

    this.parametrosService.buscarParametrosFiltrosOrder( unidadMedidaParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo) => {
        this.listaMedidasMedicamentos = resp;
    });
  }


  obtenerUsuarioActual(usuario){
    var usuarioModel = new Usuario2Modelo();
    usuarioModel.nombreUsuario = usuario;
    usuarioModel.estado = GlobalConstants.ACTIVO;
    this.usuariosService.buscarUsuariosFiltrosTabla(usuarioModel).subscribe( (resp: Usuario2Modelo[]) => {
      if(resp.length > 0 ){
        this.usuarioActual = resp[0];
        if( !this.usuarioActual.funcionarios || !this.usuarioActual.funcionarios.funcionarioId ){
          Swal.fire({
            icon: 'info',
            title: 'Atencion',
            text: "El usuario " + usuario + " no es un funcionario",
          }) 
        }
        if( !this.usuarioActual.funcionarios.areas || !this.usuarioActual.funcionarios.areas.areaId ){
          Swal.fire({
            icon: 'info',
            title: 'Atencion',
            text: "El usuario " + usuario + " no cuenta con un area asignada",
          }) 
        }        
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Atencion',
          text: "No se encontro usuario con codigo " + usuario,
        })  
      }
      
    }, e => {
      Swal.fire({
          icon: 'error',
          title: 'Algo salió mal',
          text: this.comunes.obtenerError(e),
        })
    });
  }

  buscarPaciente(event) {
    event.preventDefault();    
    var paciente = new PacienteModelo();
    var persona = new PersonaModelo();

    var cedula = this.buscadorForm.get('cedulaBusqueda').value;

    if( cedula ){
      persona.cedula = cedula;
      paciente.personas = persona;
    }else{
      paciente.personas = null;
    }
    
    paciente.pacienteId = this.buscadorForm.get('pacienteIdBusqueda').value;

    if( !persona.cedula && !paciente.pacienteId ){
      Swal.fire({
        icon: 'info',
        text: 'Debe ingresar la cédula o el identificador del paciente '
      })
      return;
    }

    this.limpiar(event);

    Swal.fire({
      title: 'Espere',
      text: 'Buscando...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.pacientesService.buscarPacientesFiltrosTabla(paciente)
    .subscribe( resp => { 
      if(resp.length <= 0){
        Swal.fire({
          icon: 'info',
          title: 'No se encontró paciente',
        })
      }else{
        Swal.close();
        for (let i = 0; i < this.listaSexo.length; i++) {
          if( this.listaSexo[i].valor == resp[0].personas.sexo ){
            resp[0].personas.sexo = this.listaSexo[i].descripcionValor;
            break;
          }
        }
        for (let i = 0; i < this.listaEstadoCivil.length; i++) {
          if( this.listaEstadoCivil[i].valor == resp[0].personas.estadoCivil ){
            resp[0].personas.estadoCivil = this.listaEstadoCivil[i].descripcionValor;
            break;
          }
        }
        for (let i = 0; i < this.listaNacionalidad.length; i++) {
          if( this.listaNacionalidad[i].valor == resp[0].personas.nacionalidad ){
            resp[0].personas.nacionalidad = this.listaNacionalidad[i].descripcionValor;
            break;
          }
        }
        this.paciente = resp[0];

        if( resp[0].personas.foto ){
          this.profile = resp[0].personas.foto;
        }else {
          this.profile = "assets/images/profile.jpg";
        }
        
        this.pacienteForm.patchValue(this.paciente);
        this.buscadorForm.get('pacienteIdBusqueda').setValue(this.paciente.pacienteId);
        this.buscadorForm.get('cedulaBusqueda').setValue(this.paciente.personas.cedula);

        this.historialClinicoId = this.pacienteForm.get('historialClinico').get('historialClinicoId').value;
        this.ageCalculator();
        if( this.paciente.pacienteId ){
          this.obtenerFichaMedica();
        }else{
          this.alertGeneral = true;
          this.mensajeGeneral = "El paciente aun no cuenta con Historial Clinico definido";
        }
      }
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });   

  }

  ageCalculator(){
    var fechaNacimiento = this.pacienteForm.get('personas').get('fechaNacimiento').value;//toString();
    if( fechaNacimiento ){
      const convertAge = new Date(fechaNacimiento);
      const timeDiff = Math.abs(Date.now() - convertAge.getTime());

      this.pacienteForm.get('personas').get('edad').setValue(Math.floor((timeDiff / (1000 * 3600 * 24))/365));
    }
  }
 
  obtenerFichaMedica(){    
    this.obtenerAlergias();
  }


  obtenerAlergias() {
    var alergias = new AlergiaModelo();

    this.alergias = [];

    alergias.pacienteId = this.paciente.pacienteId;

    this.alergiaService.buscarAlergiasFiltros(alergias)
    .subscribe( ( resp : AlergiaModelo[] ) => {

      this.alergias = resp;
    }, e => {      
      console.log(this.comunes.obtenerError(e));
    });
  }


  crearFormulario() {
    this.pacienteForm = this.fb.group({
      pacienteId  : [null, [] ],
      historialClinico: this.fb.group({
        historialClinicoId: [null, [] ]
      }),
      personas : this.fb.group({
        personaId  : [null, [] ],
        cedula  : [null, [] ],
        nombres  : [null, [] ],
        apellidos: [null, [] ],
        fechaNacimiento: [null, [] ],
        lugarNacimiento: [null, [] ],
        edad: [null, [] ],
        direccion: [null, [] ],
        sexo: [null, [] ],
        estadoCivil: [null, [] ],
        nacionalidad: [null, [] ],
        telefono: [null, [] ],
        email  : [null, [] ],
        celular: [null, [] ],
        observacion: [null, [] ],
        carreras: this.fb.group({
          carreraId: [null, [] ],
          descripcion: [null, [] ]
        }),
        departamentos: this.fb.group({
          carreraId: [null, [] ],
          descripcion: [null, [] ]
        }),
        dependencias: this.fb.group({
          carreraId: [null, [] ],
          descripcion: [null, [] ]
        }),
        estamentos: this.fb.group({
          carreraId: [null, [] ],
          descripcion: [null, [] ]
        }),
        fechaCreacion: [null, [] ],
        fechaModificacion: [null, [] ],
        usuarioCreacion: [null, [] ],
        usuarioModificacion: [null, [] ]   
      }),
      grupoSanguineo  : [null, [] ],
      seguroMedico  : [null, [] ]        
    });

        
    this.buscadorModalForm = this.fb3.group({
      cedula  : ['', [] ],
      nombres  : ['', [] ],
      apellidos: ['', [] ]   
    });

    this.buscadorForm = this.fb4.group({
      pacienteIdBusqueda  : ['', [] ],
      cedulaBusqueda  : ['', [] ]
    });
   
  }

  crearTablaModel(){
    this.dtOptionsBuscador = {
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
    //this.cargando = true;
    this.loadBuscadorPacientes = true;
    this.pacientesService.buscarPacientesFiltrosTabla(buscadorPaciente)
    .subscribe( ( resp : PacienteModelo[] ) => {
      this.loadBuscadorPacientes = false;
      this.pacientes = resp;
      //this.cargando = false;
    }, e => {
      this.loadBuscadorPacientes = false;;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      //this.cargando = false;
    });
  }

  
  limpiarModal(event) {
    event.preventDefault();
    this.buscadorModalForm.reset();
  }

  
  limpiar(event){
    event.preventDefault();
    this.pacienteForm.reset();    
    this.buscadorForm.reset();
    this.alertGeneral=false;
    this.profile = "assets/images/profile.jpg";
  }

  cerrarAlert(){
    this.alert=false;
  }
 
  cerrarAlertGeneral(){
    this.alertGeneral=false;
  }
  cerrarAlertGuardar(){
    this.alertGuardar=false;
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
        this.buscadorForm.get('cedulaBusqueda').setValue(resp.personas.cedula);
        this.buscadorForm.get('pacienteIdBusqueda').setValue(resp.pacienteId);
        this.buscarPaciente(event);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
          this.buscadorForm.get('pacienteIdBusqueda').setValue(null);
        }
      );
  }

  onSubmit() {
    this.modalService.dismissAll();
  }
 
  agregarProcedimiento(event) {
    event.preventDefault();
    var idPaciente : number = this.buscadorForm.get('pacienteIdBusqueda').value;
    var valor = "enfermeria-" + idPaciente;
    this.router.navigate(['inicio/procedimiento', valor]);
  }

  agregarSignoVital(event) {
    event.preventDefault();
    var idPaciente : number = this.buscadorForm.get('pacienteIdBusqueda').value;
    var valor = "enfermeria-" + idPaciente;
    this.router.navigate(['inicio/signoVital', valor]);
  }

  agregarCita(event) {
    event.preventDefault();
    var idPaciente : number = this.buscadorForm.get('pacienteIdBusqueda').value;
    var valor = "enfermeria-" + idPaciente;
    this.router.navigate(['inicio/cita', valor]);
  }

}
