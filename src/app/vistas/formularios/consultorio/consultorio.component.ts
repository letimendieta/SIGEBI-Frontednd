import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ParametroModelo } from '../../../modelos/parametro.modelo';
import { ParametrosService } from '../../../servicios/parametros.service';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { PacienteModelo } from '../../../modelos/paciente.modelo';
import { PatologiaProcedimientoModelo } from '../../../modelos/patologiaProcedimiento.modelo';
import { PacientesService } from '../../../servicios/pacientes.service';
import { AntecedentesService } from '../../../servicios/antecedentes.service';
import { AlergiasService } from '../../../servicios/alergias.service';
import { HistorialesClinicosService } from '../../../servicios/historialesClinicos.service';
import { StocksService } from '../../../servicios/stocks.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PersonaModelo } from 'src/app/modelos/persona.modelo';
import { AntecedenteModelo } from 'src/app/modelos/antecedente.modelo';
import { AlergiaModelo } from 'src/app/modelos/alergia.modelo';
import { HistorialClinicoModelo } from 'src/app/modelos/historialClinico.modelo';
import { StockModelo } from 'src/app/modelos/stock.modelo';
import { AnamnesisModelo } from 'src/app/modelos/anamnesis.modelo';
import { Observable, Subject } from 'rxjs';
import { DiagnosticoModelo } from 'src/app/modelos/diagnostico.modelo';
import { TratamientoModelo } from 'src/app/modelos/tratamiento.modelo';
import { ProcesoDiagnosticoTratamientoModelo } from 'src/app/modelos/procesoDiagnosticoTratamiento.modelo';
import { ProcesoDiagnosticoTratamientosService } from 'src/app/servicios/procesoDiagnosticoTratamiento.service';
import { TratamientoInsumoModelo } from 'src/app/modelos/tratamientoInsumo.modelo';
import { ConsultaModelo } from 'src/app/modelos/consulta.modelo';
import { ConsultasService } from 'src/app/servicios/consultas.service';
import { DataTableDirective } from 'angular-datatables';
import { UploadFileService } from 'src/app/servicios/upload-file.service';
import { MotivoConsultaModelo } from 'src/app/modelos/motivoConsulta.modelo';
import { MotivosConsultaService } from 'src/app/servicios/motivosConsulta.service';
import { SignoVitalModelo } from 'src/app/modelos/signoVital.modelo';
import { SignosVitalesService } from 'src/app/servicios/signosVitales.service';
import { FichaMedicaModelo } from 'src/app/modelos/fichaMedica.modelo';
import { AlergenosService } from 'src/app/servicios/alergenos.service';
import { AlergenoModelo } from 'src/app/modelos/alergeno.modelo';
import { PatologiasProcedimientosService } from 'src/app/servicios/patologiasProcedimientos.service';
import { EnfermedadCie10Modelo } from 'src/app/modelos/enfermedadCie10.modelo';
import { EnfermedadesCie10Service } from 'src/app/servicios/enfermedadesCie10.service';
import { ReporteModelo } from 'src/app/modelos/reporte.modelo';
import { TratamientosInsumosService } from 'src/app/servicios/tratamientosInsumos.service';
import { VacunacionModelo } from 'src/app/modelos/vacunacion.modelo';
import { VacunacionesService } from 'src/app/servicios/vacunaciones.service';
import { PreguntaModelo } from 'src/app/modelos/pregunta.modelo';
import { PreguntaHistorialModelo } from 'src/app/modelos/preguntaHistorial.modelo';
import { PreguntasService } from 'src/app/servicios/preguntas.service';
import { PreguntasHistorialService } from 'src/app/servicios/preguntasHistorial.service';
import { MedicamentoModelo } from 'src/app/modelos/medicamento.modelo';
import { MedicamentosService } from 'src/app/servicios/medicamentos.service';
import { UsuariosService } from 'src/app/servicios/usuarios.service';
import { TokenService } from 'src/app/servicios/token.service';
import { GlobalConstants } from 'src/app/common/global-constants';
import { Usuario2Modelo } from 'src/app/modelos/usuario2.modelo';

@Component({
  selector: 'app-consultorio',
  templateUrl: './consultorio.component.html',
  styleUrls: ['./consultorio.component.css']
})

export class ConsultorioComponent implements OnInit {
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
  dtOptionsBuscadorStock: any = {};
  dtOptionsBuscador: any = {};
  dtOptionsPatologias: any = {};  
  dtOptionsAntecedentes: any = {};
  dtOptionsAntecedentesFamiliares: any = {};
  dtOptionsAlergias: any = {};
  dtOptionsVacunaciones: any = {};
  dtOptionsStock: any = {};  
  dtOptionsEnfermedadCie10: any = {};
  dtOptionsConsultas: any = {};
  dtOptionsMedicamentos: any = {};
  dtOptionsSignosVitales: any = {};
  dtOptionsFichaMedica: any = {};
  dtTriggerMedicamentos : Subject<any> = new Subject<any>();
  dtTriggerStock : Subject<any> = new Subject<any>();
  dtTriggerConsultas : Subject<any> = new Subject<any>();
  dtTriggerAlergias : Subject<any> = new Subject<any>();
  dtTriggerAntecedentes : Subject<any> = new Subject<any>();
  dtTriggerAntecedentesFamiliares : Subject<any> = new Subject<any>();
  dtTriggerPatologias : Subject<any> = new Subject<any>();
  dtTriggerVacunaciones : Subject<any> = new Subject<any>();
  dtTriggerSignosVitales : Subject<any> = new Subject<any>();
  dtTriggerFichaMedica : Subject<any> = new Subject<any>();
  hcid = 0;
  fileInfos: Observable<any>;
  hiddenAlergenos = true;
  hiddenAntePatProc = true;
  hiddenPatologiaActual = true;
  existePatologiaActual = 0;
  profile: any = "assets/images/profile.jpg";
  size:any=0;
  nombre:any = "";
  mensajeError: String;
  usuarioActual: Usuario2Modelo;
  rolesUsuario: Array<String> = [];
  deshabilitarMedicamentos = true;
  deshabilitarActualizarHC = true;
  deshabilitarPestanhaAnamnesis = true;
  loadBuscadorCie = false;
  loadBuscadorMedicamentos = false;
  loadBuscadorPacientes = false;
  

  constructor( private historialClinicosService: HistorialesClinicosService,
               private tokenService: TokenService,
               private parametrosService: ParametrosService,
               private comunes: ComunesService,
               private pacientesService: PacientesService,
               private antecedentesService: AntecedentesService,
               private alergiaService: AlergiasService,
               private vacunacionesService: VacunacionesService,
               private alergenosService: AlergenosService,
               private patologiasProcedimientosService: PatologiasProcedimientosService,
               private modalService: NgbModal,
               private usuariosService: UsuariosService,
               private stockService: StocksService,
               private enfermedadesCie10Service: EnfermedadesCie10Service,
               private consultasService: ConsultasService,
               private signosVitalesService: SignosVitalesService,
               private uploadService: UploadFileService,
               private medicamentosService: MedicamentosService,
               private motivosConsultaService: MotivosConsultaService,
               private procesoDiagnosticoTratamientoService: ProcesoDiagnosticoTratamientosService,
               private tratamientosInsumosService: TratamientosInsumosService,
               private preguntasService: PreguntasService,
               private preguntasHistorialService: PreguntasHistorialService,
               private fb: FormBuilder,
               private fb2: FormBuilder,
               private fb3: FormBuilder,
               private fb4: FormBuilder,
               private fb5: FormBuilder,
               private fb6: FormBuilder,
               private fb7: FormBuilder,
               private fb8: FormBuilder,
               private fb9: FormBuilder,
               private fb10: FormBuilder,
               private fb11: FormBuilder,
               private fb12: FormBuilder,
               private fb13: FormBuilder,
               private fb14: FormBuilder,
               private fb15: FormBuilder) { 
    this.crearFormulario();
    this.verificarRoles();
    this.obtenerUsuarioActual(this.tokenService.getUserName().toString());
    this.ngOnInit();
  }              

  ngOnInit() {
    this.obtenerParametros();
    this.listarMotivosConsultas();
    this.crearTablaPatologias();
    this.crearTablaAntecedentes();
    this.crearTablaAlergias();
    this.crearTablaAntecedentesFamiliares();
    this.crearTablaVacunaciones();
    this.crearTablaMedicamentos();
    this.crearTablaModel();
    this.crearTablaModelStock();
    this.crearTablaModelTerminoEstandar();
    this.crearTablaConsultas();
    this.crearSignosVitales();
    this.crearFichaMedica();
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

  listarMotivosConsultas() {
    var orderBy = "descripcion";
    var orderDir = "asc";
    var motivoConsulta = new MotivoConsultaModelo();
    motivoConsulta.estado = "A";

    this.motivosConsultaService.buscarMotivosConsultaFiltros(motivoConsulta, orderBy, orderDir )
      .subscribe( (resp: MotivoConsultaModelo[]) => {
        this.listaMotivosConsulta = resp;
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

  verificarRoles(){
    for (let i = 0; i < this.tokenService.roles.length; i++) {
      this.rolesUsuario.push(this.tokenService.roles[i].toString());
    }

    if(this.rolesUsuario.includes(GlobalConstants.ROL_CLINICA_MEDICA)
      || this.rolesUsuario.includes(GlobalConstants.ROL_ADMIN)){
        this.deshabilitarMedicamentos = false;
        this.deshabilitarActualizarHC = false;
        this.deshabilitarPestanhaAnamnesis = false;
    }
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
          this.obtenerHistorialClinico();          
          this.obtenerFichaMedica();
          this.obtenerConsultas();
          this.obtenerSignosVitales();
          this.guardarBtn = false;
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

  myUploader(event) {
  
  }

  obtenerHistorialClinico() {   
    var historialClinico = new HistorialClinicoModelo();

    historialClinico.pacienteId = this.paciente.pacienteId;
    
    this.historialClinicosService.buscarHistorialClinicosFiltros(historialClinico)
    .subscribe( ( resp : HistorialClinicoModelo[] )=> {
      if(resp.length > 0){
        this.historialClinicoForm.patchValue(resp[0]);
        if(this.historialClinicoForm.get('patologiaActual').value
          || this.historialClinicoForm.get('tratamientoActual').value){
          this.existePatologiaActual = 1;
        }
        if ( resp[0].historialClinicoId != null ){
          this.hcid = this.historialClinicoForm.get('historialClinicoId').value;
          var cedula = this.pacienteForm.get('personas').get('cedula').value;
          this.fileInfos = this.uploadService.getFilesName(cedula + '_' + this.hcid + '_', "HC");

          this.obtenerPreguntasSeleccionadas();
        }
      }
    }, e => {      
      console.log(this.comunes.obtenerError(e));
    });
  }

  obtenerFichaMedica(){
    this.obtenerAntecedentes();
    this.obtenerAntecedentesFamiliares();
    this.obtenerAlergias();
    this.obtenerVacunaciones();
  }

  obtenerAntecedentes() {
    var antecedente = new AntecedenteModelo();

    this.antecedentes = [];
    $('#tableAntecedentes').DataTable().destroy();

    antecedente.pacienteId = this.paciente.pacienteId;
    antecedente.tipo = "P";//antecedentes personales
    this.antecedentesService.buscarAntecedentesFiltros(antecedente)
    .subscribe( ( resp : AntecedenteModelo[] ) => {

      this.antecedentes = resp;
      this.dtTriggerAntecedentes.next();
     
    }, e => {      
      console.log(this.comunes.obtenerError(e));
    });
  }

  obtenerAntecedentesFamiliares() {
    var antecedente = new AntecedenteModelo();

    this.antecedentesFamiliares = [];
    $('#tableAntecedentesFamiliares').DataTable().destroy();

    antecedente.pacienteId = this.paciente.pacienteId;
    antecedente.tipo = "F";//antecedentes familiares
    this.antecedentesService.buscarAntecedentesFiltros(antecedente)
    .subscribe( ( resp : AntecedenteModelo[] ) => {

      this.antecedentesFamiliares = resp;
      this.dtTriggerAntecedentesFamiliares.next();
    }, e => {      
      console.log(this.comunes.obtenerError(e));
    });
  }

  obtenerAlergias() {
    var alergias = new AlergiaModelo();

    this.alergias = [];
    $('#tableAlergias').DataTable().destroy();

    alergias.pacienteId = this.paciente.pacienteId;

    this.alergiaService.buscarAlergiasFiltros(alergias)
    .subscribe( ( resp : AlergiaModelo[] ) => {

      this.alergias = resp;
      this.dtTriggerAlergias.next();
    }, e => {      
      console.log(this.comunes.obtenerError(e));
    });
  }

  obtenerVacunaciones() {
    var vacunacion = new VacunacionModelo();

    this.vacunaciones = [];
    $('#tableVacunaciones').DataTable().destroy();

    vacunacion.pacienteId = this.paciente.pacienteId;

    this.vacunacionesService.buscarVacunacionesFiltrosTabla(vacunacion)
    .subscribe( ( resp : VacunacionModelo[] ) => {

      this.vacunaciones = resp;
      this.dtTriggerVacunaciones.next();
    }, e => {      
      console.log(this.comunes.obtenerError(e));
    });
  }

  obtenerPreguntasSeleccionadas() {
    var preguntaHistorial = new PreguntaHistorialModelo();

    this.preguntas = [];

    preguntaHistorial.historialClinicoId = this.hcid;
    this.preguntasHistorialService.buscarPreguntasHistorialFiltrosTabla(preguntaHistorial)
    .subscribe(( resp : PreguntaHistorialModelo[] ) => {
        this.preguntasHistorial = resp;
        for (let i = 0; i < this.preguntasHistorial.length; i++) {
          this.preguntasSeleccionadas.push(this.preguntasHistorial[i].preguntas);
        }

      this.listarPreguntas();

    }, e => {      
      console.log(this.comunes.obtenerError(e));
    });
  }

  listarPreguntas() {
    var orderBy = "numero";
    var orderDir = "asc";
    var pregunta = new PreguntaModelo();
    pregunta.estado = "A";

    this.preguntasService.buscarPreguntasFiltrosTablaOrder(pregunta, orderBy, orderDir)
    .subscribe( (resp: PreguntaModelo[]) => {

        for ( let i = 0; i <resp.length ; i++){
          for ( let j = 0; j <this.preguntasSeleccionadas.length ; j++){
            if( resp[i].preguntaId == this.preguntasSeleccionadas[j].preguntaId ){
              this.preguntas.push(resp[i]);
              break;
            }
          }
        }      
    }, e => {      
      console.log(this.comunes.obtenerError(e));
    });
  }

  listarAlergenos() {
   
    this.alergenosService.getAlergenos()
    .subscribe( ( resp : AlergenoModelo[] ) => {

      this.diagnosticoAlergias = resp;
    }, e => {      
      console.log(this.comunes.obtenerError(e));
    });
  }

  listarPatologiasProcedimientos() {
   
    this.patologiasProcedimientosService.getPatologiasProcedimientos()
    .subscribe( ( resp : PatologiaProcedimientoModelo[] )=> {

      this.diagnosticoAntecPatolProc = resp;
    }, e => {      
      console.log(this.comunes.obtenerError(e));
    });
  }

  agregarAficha(event){
    var ficha: FichaMedicaModelo  = new FichaMedicaModelo();
    
    var opcionFicha = this.selectFichaMedicaForm.get('selectOpcionFicha').value;    
    var idAlergeno = this.selectFichaMedicaForm.get('selectAlergeno').value;
    var idAntecedente = this.selectFichaMedicaForm.get('selectAntecPatologiasProcedimientos').value;

    if( opcionFicha == "ALE"){
      for (let i = 0; i < this.diagnosticoAlergias.length; i++) {
        if(this.diagnosticoAlergias[i].alergenoId == Number(idAlergeno)){
          ficha.id = this.diagnosticoAlergias[i].alergenoId;
          ficha.codigo = this.diagnosticoAlergias[i].codigo;
          ficha.descripcion = this.diagnosticoAlergias[i].descripcion;
          ficha.tipo = opcionFicha;
          ficha.pacienteId = this.paciente.pacienteId;

          $('#tableFichaMedica').DataTable().destroy();
          this.fichaMedica.push(ficha);
          this.dtTriggerFichaMedica.next();
        }
      }
    }else if( opcionFicha == "P/P"){
      for (let i = 0; i < this.diagnosticoAntecPatolProc.length; i++) {
        if(this.diagnosticoAntecPatolProc[i].patologiaProcedimientoId== Number(idAntecedente)){
          ficha.id = this.diagnosticoAntecPatolProc[i].patologiaProcedimientoId;
          ficha.codigo = this.diagnosticoAntecPatolProc[i].codigo;
          ficha.descripcion = this.diagnosticoAntecPatolProc[i].descripcion;
          ficha.tipo = opcionFicha;
          ficha.pacienteId = this.paciente.pacienteId;

          $('#tableFichaMedica').DataTable().destroy();
          this.fichaMedica.push(ficha);
          this.dtTriggerFichaMedica.next();
        }
      }
    }
  }

  obtenerConsultas() {
    var consultas = new ConsultaModelo();
    consultas.pacienteId = this.paciente.pacienteId;
    consultas.funcionarios.funcionarioId = this.usuarioActual.funcionarios.funcionarioId;

    this.consultas = [];
    $('#tableConsultas').DataTable().destroy();

    this.consultasService.buscarConsultasFiltrosTabla(consultas)
    .subscribe( ( resp : ConsultaModelo[] )=> {     

      this.consultas = resp;
      this.dtTriggerConsultas.next();
      
    }, e => {      
      console.log(this.comunes.obtenerError(e));
    });
  }

  obtenerSignosVitales() {
    var signoVital = new SignoVitalModelo();
    signoVital.pacientes.pacienteId = this.paciente.pacienteId;
    signoVital.funcionarios = null;

    this.signosVitales = [];
    $('#tableSignosVitales').DataTable().destroy();

    this.signosVitalesService.buscarSignosVitalesFiltrosTabla(signoVital)
    .subscribe( (resp : SignoVitalModelo[] )=> {     

      this.signosVitales = resp;
      this.dtTriggerSignosVitales.next();
      
    }, e => {      
      console.log(this.comunes.obtenerError(e));
    });
  }

  getCheckedPreguntas(pregunta) {

    for (let i = 0; i < this.preguntasSeleccionadas.length; i++) {
      if(this.preguntasSeleccionadas[i].preguntaId == pregunta.preguntaId) {        
        return true;
      }
    }
    return false;
  }

  opcionFicha(event: any){
    var opcion = event.target.value;
    if( opcion == "ALE" ){
      this.listarAlergenos();
      this.hiddenAlergenos = false;
      this.hiddenAntePatProc = true;
      this.hiddenPatologiaActual = true;   
    }else if( opcion == "P/T" ){ 
      this.hiddenPatologiaActual = false;     
      this.hiddenAlergenos = true; 
      this.hiddenAntePatProc = true;      
      this.selectFichaMedicaForm.get('patologiaActual').setValue(this.historialClinicoForm.get('patologiaActual').value);
      this.selectFichaMedicaForm.get('tratamientoActual').setValue(this.historialClinicoForm.get('tratamientoActual').value);
    }else if( opcion == "P/P" ){
      this.listarPatologiasProcedimientos();
      this.hiddenAlergenos = true;
      this.hiddenAntePatProc = false;
      this.hiddenPatologiaActual = true;
    }else if( opcion == "null" ){
      this.hiddenAlergenos = true;
      this.hiddenAntePatProc = true;
      this.hiddenPatologiaActual = true;
    }
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

    this.historialClinicoForm = this.fb2.group({
      historialClinicoId  : [null, [] ],
      patologiaActual  : [null, [] ], 
      tratamientoActual  : [null, [] ],      
      areas  : this.fb2.group({
        areaId: [null, [] ],
        descripcion: [null, [] ]
      }),     
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ],             
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

    //this.pacienteForm.get('pacienteId').disable();

    this.stockForm = this.fb5.group({
      insumos : this.fb5.group({
        insumoId  : [null, [ Validators.required] ]
      }),
    });

    this.buscadorStockForm = this.fb6.group({
      medicamentoId  : [null, [] ],
      codigo: [null, [] ],
      medicamento  : [null, [] ]
    });
    
    this.buscadorEnfermedadesCie10Form = this.fb7.group({      
      enfermedadCie10Id  : [null, [] ],
      codigo  : [null, [] ],
      descripcion  : [null, [] ],
    });
    
    this.anamnesisForm = this.fb8.group({
      anamnesisId  : [null, [] ],
      motivoConsultaId: [null, [ Validators.required]  ],
      antecedentes  : [null, [] ],
      antecedentesRemotos  : [null, [] ]
    });

    this.diagnosticoPrimarioForm = this.fb9.group({
      diagnosticoPrincipal  : [null, [ Validators.required]  ],
      terminoEstandarPrincipal  : [null, [] ]
    });

    this.diagnosticoSecundarioForm = this.fb10.group({
      diagnosticoSecundario  : [null, [] ],
      terminoEstandarSecundario  : [null, [] ]
    });

    this.selectFichaMedicaForm  = this.fb11.group({
      selectOpcionFicha  : [null, [] ],
      selectAlergeno  : [null, [] ],
      selectAntecPatologiasProcedimientos  : [null, [] ],
      patologiaActual : [null, [] ],
      tratamientoActual : [null, [] ]
    });

    this.tratamientoFarmacologicoForm = this.fb12.group({
      prescripcionFarm  : [null, [] ]
    });

    this.tratamientoNoFarmacologicoForm = this.fb13.group({
      descripcionTratamiento  : [null, [] ]
    });

    this.planTrabajoForm = this.fb14.group({
      descripcionPlan  : [null, [] ]
    });

    this.detalleConsultaForm = this.fb15.group({
      consultaId  : [null, [] ],
      anamnesis: this.fb15.group({
        anamnesisId  : [null, [] ],
        motivoConsulta: this.fb15.group({
          motivoConsultaId: [null, [] ],
          descripcion: [null, [] ]
        }),
        antecedentes  : [null, [] ],
        antecedentesRemotos  : [null, [] ]
      }),
      diagnosticos: this.fb15.group({
        diagnosticoId  : [null, [] ],
        diagnosticoPrincipal  : [null, [] ],
        diagnosticoSecundario  : [null, [] ],
        enfermedadCie10Primaria: this.fb15.group({
          descripcion: [null, [] ]
        }),
        enfermedadCie10Secundaria: this.fb15.group({
          descripcion: [null, [] ]
        })
      }),
      tratamientos: this.fb15.group({
        tratamientoId  : [null, [] ],
        prescripcionFarm  : [null, [] ],
        descripcionTratamiento  : [null, [] ],
        descripcionPlanTrabajo  : [null, [] ]
      }),
      medicamentos : [ null, [] ],
      fecha : [null, [] ],
      areas  : this.fb15.group({
        areaId: [null, [] ],
        descripcion: [null, [] ]
      }),
      funcionarios : this.fb15.group({
        funcionarioId  : [null, [] ],
        personas : this.fb15.group({
          personaId  : [null, [] ],
          cedula  : [null, [] ],
          nombres  : [null, [] ],
          apellidos: [null, [] ]    
        })               
      }) 
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

  crearTablaPatologias(){
    this.dtOptionsPatologias = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      searching: false, 
      info : true,     
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
      info : true,
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
        {data:'antecedenteId'}, {data:'patologiasProcedimientos.descripcion'} ,
        {data:'tipo'}
      ]
    };
  }

  crearTablaAntecedentesFamiliares(){
    this.dtOptionsAntecedentesFamiliares = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      searching: false,
      info : true,
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
        {data:'antecedenteId'}, {data:'patologiasProcedimientos.descripcion'} ,
        {data:'tipo'}
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
        {data:'alergiaId'},
        {data:'alergenos.descripcion'}
      ]
    };
  }

  crearTablaVacunaciones(){
    this.dtOptionsVacunaciones = {
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
        {data:'vacunaId'},{data:'codigo'},
        {data:'descripcion'},{data:'estado'},
      ]
    };
  }

  crearTablaModelStock(){
    this.dtOptionsStock = {
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
      columns: [ {data:'medicamentos.medicamentoId'}, 
      {data:'medicamentos.codigo'},
      {data:'medicamentos.medicamento'},
      {data:'medicamentos.concentracion'},
      {data:'medicamentos.forma'},
      {data:'medicamentos.presentacion'},
      {data:'cantidad'}]      
    };
  }

  crearTablaModelTerminoEstandar(){
    this.dtOptionsEnfermedadCie10 = {
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
      columns: [ {data:'id'}, {data:'codigoUnico'}, 
      {data:'termino'}]      
    };
  }
  
  crearTablaConsultas(){
    this.dtOptionsConsultas = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      searching: false,
      order: [0,"desc"],
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
      columns: [ {data:'consultaId'}, {data:'fecha'}, 
      {data:'anamnesis.descripcion'},
      {data:'diagnosticos.enfermedadCie10Primaria.descripcion'},
      {data:'diagnosticos.enfermedadCie10Secundaria.descripcion'},
      //{data:'diagnosticos.diagnosticoPrincipal'},      
      //{data:'diagnosticos.diagnosticoSecundario'}, 
      {data:'funcionario'},
      {data:'areas.codigo'}, {data:'ver'}, {data:'imprimir'}]      
    };
  }

  crearSignosVitales(){
    this.dtOptionsSignosVitales = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      searching: false,
      order: [0,"desc"],
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
      columns: [ {data:'signoVitalId'}, {data:'fecha'}, 
      {data:'frecuenciaCardiaca'},
      {data:'frecuenciaRespiratoria'},
      {data:'presionArterial'},
      {data:'temperatura'},      
      {data:'peso'}, 
      {data:'talla'}, {data:'funcionarios.personas.nombres'}, {data:'ver'}]      
    };
  }

  crearFichaMedica(){
    this.dtOptionsFichaMedica = {
      pagingType: 'full_numbers',
      pageLength: 5,
      lengthMenu: [[5,10,15,20,50,-1],[5,10,15,20,50,"Todos"]],
      searching: false,
      order: [0,"desc"],
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
      columns: [ {data:'#'}, {data:'id'}, {data:'codigo'}, 
      {data:'descripcion'},
      {data:'tipo'}, {data:'quitar'}]      
    };
  }

  crearTablaMedicamentos(){
    this.dtOptionsMedicamentos = {
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
        "emptyTable":" "
      },
      processing: true,
      columns: [
        {data:'#'},
        {data:'medicamentos.medicamentoId'}, 
        {data:'medicamentos.codigo'}, 
        {data:'medicamentos.medicamento'},
        {data:'medicamentos.concentracion'}, 
        {data:'medicamentos.forma'}, 
        {data:'medicamentos.presentacion'}, 
        {data:'cantidad'},
        {data:'quitar'}
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

  quitarMedicamento(event, tratamientoInsumo: TratamientoInsumoModelo ) {

    for (let i = 0; i < this.tratamientosInsumos.length; i++) {
      if( this.tratamientosInsumos[i].medicamentos.medicamentoId == tratamientoInsumo.medicamentos.medicamentoId ){
        $('#tableMedicamentos').DataTable().destroy();
        this.tratamientosInsumos.splice(i, 1);        
        this.dtTriggerMedicamentos.next();
        break;
      }
    }
  }
  quitarFicha(event, ficha: FichaMedicaModelo ) {

    for (let i = 0; i < this.fichaMedica.length; i++) {
      if( this.fichaMedica[i].id == ficha.id ){
        $('#tableFichaMedica').DataTable().destroy();
        this.fichaMedica.splice(i, 1);        
        this.dtTriggerFichaMedica.next();
        break;
      }
    }
  }

  buscadorStock(event) {
    event.preventDefault();
    var buscador = new StockModelo();
    var medicamento = new MedicamentoModelo();
    medicamento = this.buscadorStockForm.getRawValue();

    if(!medicamento.medicamentoId && !medicamento.codigo && !medicamento.medicamento){
      this.alert=true;
      return;
    }
    buscador.medicamentos = medicamento;
    this.loadBuscadorMedicamentos = true;
    this.stockService.buscarStocksFiltrosTabla(buscador)
    .subscribe( (resp : StockModelo[] )=> {
      this.loadBuscadorMedicamentos = false;
      this.stocks = resp;
    }, e => {
      this.loadBuscadorMedicamentos = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  buscadorEnfermedadCie10(event) {
    event.preventDefault();
    var buscador = new EnfermedadCie10Modelo();

    buscador = this.buscadorEnfermedadesCie10Form.getRawValue();

    if( !buscador.enfermedadCie10Id && !buscador.codigo && !buscador.descripcion ){
      this.alert=true;
      return;
    }
    this.loadBuscadorCie = true;
    this.enfermedadesCie10Service.buscarEnfermedadesCie10FiltrosTabla(buscador)
    .subscribe( ( resp : EnfermedadCie10Modelo[] )=> {
      this.loadBuscadorCie = false;
      this.enfermedadesCie10 = resp;
    }, e => {
      this.loadBuscadorCie = false;
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  selectStock(event, stock: StockModelo){
    this.modalService.dismissAll();
   
    this.medicamentosService.getMedicamento( stock.medicamentos.medicamentoId )
      .subscribe( (resp: MedicamentoModelo) => {

        var tratamientoInsumo: TratamientoInsumoModelo  = new TratamientoInsumoModelo();
        tratamientoInsumo.medicamentos = resp;

        if(this.tratamientosInsumos.length > 0){
          for (let i = 0; i < this.tratamientosInsumos.length; i++) {
            if(this.tratamientosInsumos[i].medicamentos.medicamentoId == resp.medicamentoId){
              this.alertMedicamentos=true;
              return null;
            }
          }
          $('#tableMedicamentos').DataTable().destroy();
          this.tratamientosInsumos.push(tratamientoInsumo);
          this.dtTriggerMedicamentos.next();
        }else{
          $('#tableMedicamentos').DataTable().destroy();
          this.tratamientosInsumos.push(tratamientoInsumo);
          this.dtTriggerMedicamentos.next();
         
        }
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
        }
      );
  }

  selectEnfermedadCie10(event, enfermedadCie10: EnfermedadCie10Modelo){
    this.modalService.dismissAll();

    this.enfermedadesCie10Service.getEnfermedadCie10( enfermedadCie10.enfermedadCie10Id )
      .subscribe( (resp: EnfermedadCie10Modelo) => {
        if ( this.tipoDiagnostico == "P" ){
          this.enfermedadCie10PrincipalSeleccionada = resp;
        }else if ( this.tipoDiagnostico == "S" ){
          this.enfermedadCie10SecundariaSeleccionada = resp;
        }
        this.tipoDiagnostico = null;
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
        }
      );
  }

  limpiarModal(event) {
    event.preventDefault();
    this.buscadorModalForm.reset();
  }

  limpiarModalStock(event) {
    event.preventDefault();
    this.buscadorStockForm.reset();
  }

  limpiarModalTerminoEstandar(event) {
    event.preventDefault();
    this.buscadorEnfermedadesCie10Form.reset();
    this.enfermedadesCie10 = [];
  }

  limpiar(event){
    event.preventDefault();
    this.pacienteForm.reset();
    this.historialClinicoForm.reset();
    this.buscadorForm.reset();
    this.anamnesisForm.reset();
    this.antecedentes = [];
    $('#tableAntecedentes').DataTable().destroy();
    this.antecedentesFamiliares = [];
    $('#tableAntecedentesFamiliares').DataTable().destroy();
    this.alergias = [];
    $('#tableAlergias').DataTable().destroy();
    this.consultas = [];
    $('#tableConsultas').DataTable().destroy();
    this.signosVitales = [];
    $('#tableSignosVitales').DataTable().destroy();
    this.vacunaciones = [];
    $('#tableVacunaciones').DataTable().destroy();
    this.diagnosticoPrimarioForm.reset();
    this.diagnosticoSecundarioForm.reset();
    this.tratamientoFarmacologicoForm.reset();
    this.tratamientoNoFarmacologicoForm.reset();
    this.planTrabajoForm.reset();
    this.enfermedadCie10PrincipalSeleccionada = new EnfermedadCie10Modelo();
    this.enfermedadCie10SecundariaSeleccionada = new EnfermedadCie10Modelo();
    this.procesoDiagnosticoTratamiento = new ProcesoDiagnosticoTratamientoModelo();
    this.alertGeneral=false;
    this.guardarBtn = true;
    this.existePatologiaActual = 0;
    this.profile = "assets/images/profile.jpg";
  }

  limpiarDiagnosticoTratamiento() {
    this.diagnosticoPrimarioForm.reset();
    this.diagnosticoSecundarioForm.reset();
    this.tratamientoFarmacologicoForm.reset();
    this.tratamientoNoFarmacologicoForm.reset();
    this.selectFichaMedicaForm.reset();
    this.planTrabajoForm.reset();
    this.anamnesisForm.reset();
    this.tratamientosInsumos = [];
    $('#tableMedicamentos').DataTable().destroy();
    this.dtTriggerMedicamentos.next();
    this.fichaMedica = [];
    $('#tableFichaMedica').DataTable().destroy();
    this.dtTriggerFichaMedica.next();
    this.enfermedadCie10PrincipalSeleccionada = new EnfermedadCie10Modelo();
    this.enfermedadCie10SecundariaSeleccionada = new EnfermedadCie10Modelo();
    this.hiddenAlergenos = true;
    this.hiddenAntePatProc = true;
    this.hiddenPatologiaActual = true;   
    this.procesoDiagnosticoTratamiento = new ProcesoDiagnosticoTratamientoModelo();
  }

  cerrarAlert(){
    this.alert=false;
  }
  cerrarAlertMedicamento(){
    this.alertMedicamentos=false;
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

  openModalStock(targetModal) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
   
    this.buscadorStockForm.patchValue({
      medicamentoId: null,
      codigo: null,
      medicamento: null
    });
    this.stocks = [];
    this.alert=false;
  }

  openModalDetalleConsulta(targetModal, consulta) {
   
    var tratamientosInsumos: TratamientoInsumoModelo[] = [];
    var tratamientoInsumo = new TratamientoInsumoModelo();
    var tratamientos = new TratamientoModelo();
    tratamientos.tratamientoId = consulta.tratamientos.tratamientoId;

    tratamientoInsumo.tratamientos = tratamientos;
    this.detalleConsultaForm.reset();
    this.tratamientosInsumosService.buscarTratamientosInsumosFiltrosTabla(tratamientoInsumo)
    .subscribe( (resp: TratamientoInsumoModelo[]) => {
      tratamientosInsumos = resp;
      var medicamentos = "";
      for (let i = 0; i < tratamientosInsumos.length; i++) {
        medicamentos = medicamentos 
          + tratamientosInsumos[i].medicamentos.medicamento + "  -  "
          + tratamientosInsumos[i].cantidad + "    ";
      }
      this.detalleConsultaForm.get('medicamentos').setValue(medicamentos);
  });
    this.detalleConsultaForm.patchValue(consulta);
    
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
  }

  openModalTerminoEstandar(targetModal, tipo) {
    this.tipoDiagnostico = tipo;
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
   
    this.buscadorEnfermedadesCie10Form.patchValue({
      enfermedadCie10Id  : null,
      codigo  : null,
      descripcion  : null
    });
    this.enfermedadesCie10 = [];
    this.alert=false;
  }

  openModalConfirmacion(targetModal) {

    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
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

  guardarDiagnosticoTratamiento(event, targetModal){
    event.preventDefault();
    if ( this.diagnosticoPrimarioForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.diagnosticoPrimarioForm.controls ).forEach( control => {

        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }

    if ( this.diagnosticoSecundarioForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.diagnosticoSecundarioForm.controls ).forEach( control => {

        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }

    if( !this.deshabilitarPestanhaAnamnesis ){
      if ( this.anamnesisForm.invalid ) {
        this.alertGuardar = true;
        return Object.values( this.anamnesisForm.controls ).forEach( control => {

          if ( control instanceof FormGroup ) {
            Object.values( control.controls ).forEach( control => control.markAsTouched() );
          } else {
            control.markAsTouched();
          }
        });
      }
    }

    if ( this.tratamientoFarmacologicoForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.tratamientoFarmacologicoForm.controls ).forEach( control => {

        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }

    if ( this.tratamientoNoFarmacologicoForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.tratamientoNoFarmacologicoForm.controls ).forEach( control => {

        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }

    if ( this.planTrabajoForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.planTrabajoForm.controls ).forEach( control => {

        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }    
        
    var diagnostico: DiagnosticoModelo = new DiagnosticoModelo();
    var tratamiento: TratamientoModelo = new TratamientoModelo();    
    var tratamientoInsumoList: TratamientoInsumoModelo[] = new Array();
    var fichaMedicaList: FichaMedicaModelo[] = new Array();
    var consulta: ConsultaModelo = new ConsultaModelo();
    var anamnesis: AnamnesisModelo;
    var motivoConsulta : MotivoConsultaModelo = new MotivoConsultaModelo;    
    var historialClinico: HistorialClinicoModelo = new HistorialClinicoModelo();

    anamnesis = this.anamnesisForm.getRawValue();
    motivoConsulta.motivoConsultaId = this.anamnesisForm.get('motivoConsultaId').value;
    motivoConsulta.descripcion = this.obtenerMotivoDescripcion(motivoConsulta.motivoConsultaId);
    anamnesis.motivoConsulta = motivoConsulta;
    anamnesis.usuarioCreacion = this.usuarioActual.nombreUsuario;

    diagnostico.diagnosticoPrincipal = this.diagnosticoPrimarioForm.get('diagnosticoPrincipal').value;
    diagnostico.diagnosticoSecundario = this.diagnosticoSecundarioForm.get('diagnosticoSecundario').value;
    diagnostico.enfermedadCie10PrimariaId = this.enfermedadCie10PrincipalSeleccionada.enfermedadCie10Id;
    diagnostico.enfermedadCie10Primaria = this.enfermedadCie10PrincipalSeleccionada;
    diagnostico.enfermedadCie10SecundariaId = this.enfermedadCie10SecundariaSeleccionada.enfermedadCie10Id;
    diagnostico.enfermedadCie10Secundaria = this.enfermedadCie10SecundariaSeleccionada;
    diagnostico.usuarioCreacion = this.usuarioActual.nombreUsuario;

    tratamiento.prescripcionFarm = this.tratamientoFarmacologicoForm.get('prescripcionFarm').value;
    tratamiento.descripcionTratamiento = this.tratamientoNoFarmacologicoForm.get('descripcionTratamiento').value;
    tratamiento.descripcionPlanTrabajo = this.planTrabajoForm.get('descripcionPlan').value;
    tratamiento.usuarioCreacion = this.usuarioActual.nombreUsuario;

    var rows =  $('#tableMedicamentos').DataTable().rows().data();  
    var cantidades = rows.$('input').serializeArray();

    for (let i = 0; i < cantidades.length; i++) {
      this.tratamientosInsumos[i].cantidad = Number(cantidades[i].value);
    }   
    
    tratamientoInsumoList = this.tratamientosInsumos;
    fichaMedicaList = this.fichaMedica;

    consulta.pacienteId = this.paciente.pacienteId;
    consulta.areas.areaId = this.usuarioActual.funcionarios.areas.areaId;
    consulta.funcionarios.funcionarioId = this.usuarioActual.funcionarios.funcionarioId;
    consulta.usuarioCreacion = this.usuarioActual.nombreUsuario;

    historialClinico.historialClinicoId = this.historialClinicoForm.get('historialClinicoId').value;
    historialClinico.patologiaActual = this.selectFichaMedicaForm.get('patologiaActual').value;
    historialClinico.tratamientoActual = this.selectFichaMedicaForm.get('tratamientoActual').value;
    historialClinico.usuarioModificacion = this.usuarioActual.nombreUsuario;

    this.procesoDiagnosticoTratamiento.diagnostico = diagnostico;
    this.procesoDiagnosticoTratamiento.tratamiento = tratamiento;
    this.procesoDiagnosticoTratamiento.tratamientoInsumoList = tratamientoInsumoList;
    this.procesoDiagnosticoTratamiento.consulta = consulta;
    this.procesoDiagnosticoTratamiento.anamnesis = anamnesis;
    this.procesoDiagnosticoTratamiento.fichaMedicaList = fichaMedicaList;
    this.procesoDiagnosticoTratamiento.historialClinico = historialClinico;

    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
     });    
    
  }

  confirmar(event){
    event.preventDefault();

    Swal.fire({
      title: 'Espere',
      text: 'Guardando información',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
    
    let peticion: Observable<any>;
    var reporteModelo: ReporteModelo = new ReporteModelo;

    peticion = this.procesoDiagnosticoTratamientoService.crearProcesoDiagnosticoTratamiento(this.procesoDiagnosticoTratamiento);    

    Swal.fire({
      title: 'Espere',
      text: 'Generando...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    peticion.subscribe( resp => {
      reporteModelo.consultaid = String(resp.consulta['consultaId']);
      reporteModelo.format="pdf";
      this.limpiarDiagnosticoTratamiento();
      this.obtenerConsultas();
      this.obtenerFichaMedica();
              
      Swal.fire({
        icon: 'success',
        showConfirmButton: true,
        showCloseButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Imprimir Receta',
        text: resp.mensaje

      }).then( resp => {  
        if(resp.value){     
          this.imprimirReceta(reporteModelo);
        }
      });
    }, e => {
      Swal.fire({
          icon: 'error',
          title: 'Algo salió mal',
          text: this.comunes.obtenerError(e),
        })
    });
  }

  obtenerMotivoDescripcion(motivoId){
    for (let i = 0; i < this.listaMotivosConsulta.length; i++) {
      this.listaMotivosConsulta[i].motivoConsultaId = Number(motivoId);
      return this.listaMotivosConsulta[i].descripcion;
    } 
  }

  get antecedentesNoValido() {
    return this.anamnesisForm.get('antecedentes').invalid 
    && this.anamnesisForm.get('antecedentes').touched
  }

  get antecedentesRemotosNoValido() {
    return this.anamnesisForm.get('antecedentesRemotos').invalid 
    && this.anamnesisForm.get('antecedentesRemotos').touched
  }

  get motivoNoValido() {
    return this.anamnesisForm.get('motivoConsultaId').invalid 
    && this.anamnesisForm.get('motivoConsultaId').touched
  }

  get diagnosticoNoValido() {
    return this.diagnosticoPrimarioForm.get('diagnosticoPrincipal').invalid 
    && this.diagnosticoPrimarioForm.get('diagnosticoPrincipal').touched
  }

  imprimirReceta(reporte: ReporteModelo){
    Swal.fire({
      title: 'Espere',
      text: 'Generando...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.consultasService.imprimirReceta(reporte)
    .subscribe( resp => {
      Swal.fire({
        icon: 'success',
        showConfirmButton: true,
        showCloseButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
        text: 'Receta Generada',
      })
    
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  detalleConsultaImprimirReceta(consultaId){
    var reporteModelo: ReporteModelo = new ReporteModelo;

    reporteModelo.consultaid = String(consultaId);
    reporteModelo.format="pdf";

    Swal.fire({
      title: 'Espere',
      text: 'Generando...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.consultasService.generarReceta(reporteModelo)
    .subscribe( 
      data => {
        Swal.fire({
          icon: 'success',
          title: 'Reporte ',
          text: 'Receta generada'
        }).then( resp => {
          const file = new Blob([data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);
        if ( resp.value ) {     
            //this.limpiar();
        }
      });  
      }, e => {      
        Swal.fire({
          icon: 'info',
          title: 'Algo salió mal',
          text: this.comunes.obtenerError(e)
        })
      });
      /*resp => {
      Swal.fire({
        icon: 'success',
        showConfirmButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
        text: 'Receta Generada',
      })
    
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });*/
  }

}
