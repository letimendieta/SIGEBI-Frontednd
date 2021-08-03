import { Component,  OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteModelo } from '../../../modelos/paciente.modelo';
import { ParametroModelo } from '../../../modelos/parametro.modelo';
import { PersonaModelo } from '../../../modelos/persona.modelo';
import { CarreraModelo } from '../../../modelos/carrera.modelo';
import { DepartamentoModelo } from '../../../modelos/departamento.modelo';
import { DependenciaModelo } from '../../../modelos/dependencia.modelo';
import { EstamentoModelo } from '../../../modelos/estamento.modelo';
import { PacientesService } from '../../../servicios/pacientes.service';
import { ParametrosService } from '../../../servicios/parametros.service';
import { CarrerasService } from '../../../servicios/carreras.service';
import { DepartamentosService } from '../../../servicios/departamentos.service';
import { DependenciasService } from '../../../servicios/dependencias.service';
import { EstamentosService } from '../../../servicios/estamentos.service';
import { PersonasService } from '../../../servicios/personas.service';
import { UploadFileService } from 'src/app/servicios/upload-file.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ComunesService } from 'src/app/servicios/comunes.service';
import Swal from 'sweetalert2';
import { PatologiaProcedimientoModelo } from 'src/app/modelos/patologiaProcedimiento.modelo';
import { VacunaModelo } from 'src/app/modelos/vacuna.modelo';
import { AlergenoModelo } from 'src/app/modelos/alergeno.modelo';
import { AlergenosService } from 'src/app/servicios/alergenos.service';
import { PatologiasProcedimientosService } from 'src/app/servicios/patologiasProcedimientos.service';
import { VacunasService } from 'src/app/servicios/vacunas.service';
import { ProcesoPacienteHistorialClinicoModelo } from 'src/app/modelos/procesoPacienteHistorialClinico.modelo';
import { HistorialClinicoModelo } from 'src/app/modelos/historialClinico.modelo';
import { AreaModelo } from 'src/app/modelos/area.modelo';
import { AreasService } from 'src/app/servicios/areas.service';
import { HistorialesClinicosService } from 'src/app/servicios/historialesClinicos.service';
import { AntecedenteModelo } from 'src/app/modelos/antecedente.modelo';
import { AntecedentesService } from 'src/app/servicios/antecedentes.service';
import { AlergiasService } from 'src/app/servicios/alergias.service';
import { AlergiaModelo } from 'src/app/modelos/alergia.modelo';
import { VacunacionModelo } from 'src/app/modelos/vacunacion.modelo';
import { VacunacionesService } from 'src/app/servicios/vacunaciones.service';
import { PreguntaModelo } from 'src/app/modelos/pregunta.modelo';
import { PreguntasService } from 'src/app/servicios/preguntas.service';
import { PreguntasHistorialService } from 'src/app/servicios/preguntasHistorial.service';
import { PreguntaHistorialModelo } from 'src/app/modelos/preguntaHistorial.modelo';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-paciente',
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.css']
})
export class PacienteComponent implements OnInit {
  crear = false;
  personas: PersonaModelo[] = [];  
  listaEstadoCivil: ParametroModelo;
  listaSexo: ParametroModelo;
  listaGrupoSanguineo: ParametroModelo;
  listaNacionalidad: ParametroModelo;
  listaCarreras: CarreraModelo;
  listaDepartamentos: DepartamentoModelo;
  listaDependencias: DependenciaModelo;
  listaEstamentos: EstamentoModelo;
  listaAreas: AreaModelo;
  buscadorForm: FormGroup;
  pacienteForm: FormGroup;
  selectedFiles: FileList;
  selectedFilesHistorialClinico: FileList;
  currentFile: File;
  currentFileHistorialClinico: File;
  progress = 0;
  hcid = 0;
  progressHistorialClinico = 0;
  message = '';  
  fileInfos: Observable<any>;
  fileInfosHistorialClinico: Observable<any>;
  desdeModal = true;
  cargando = false;
  alert:boolean=false;
  alertGuardar:boolean=false;
  dtOptions: any = {};
  historialClinicoForm: FormGroup;
  antecedentes: AntecedenteModelo[] = [];
  alergias: AlergiaModelo[] = [];
  antecedentesFamiliares: AntecedenteModelo[] = [];
  patologiasProcedimientos: PatologiaProcedimientoModelo[] = [];
  patologiasFamiliares: PatologiaProcedimientoModelo[] = [];
  preguntas: PreguntaModelo[] = [];
  preguntasHistorial: PreguntaHistorialModelo[] = [];
  vacunas: VacunaModelo[] = [];
  alergenos: AlergenoModelo[] = [];
  vacunaciones: VacunacionModelo[] = [];
  alergenosSeleccionados: number[] = [];
  patologiasProcedimientosSeleccionados: number[] = [];
  patologiasFamiliaresSeleccionados: number[] = [];
  vacunasSeleccionadas: number[] = [];
  preguntasSeleccionadas: PreguntaModelo[] = [];  
  profile: any = "assets/images/profile.jpg";
  size:any=0;
  nombre:any = "";

  constructor( private tokenService: TokenService,
               private pacientesService: PacientesService,
               private parametrosService: ParametrosService,
               private carrerasService: CarrerasService,
               private departamentosService: DepartamentosService,
               private dependenciasService: DependenciasService,
               private comunes: ComunesService,
               private estamentosService: EstamentosService,
               private personasService: PersonasService,
               private uploadService: UploadFileService,
               private areasService: AreasService,
               private historialClinicosService: HistorialesClinicosService,
               private antecedentesService: AntecedentesService,
               private alergiaService: AlergiasService,
               private vacunacionesService: VacunacionesService,
               private preguntasService: PreguntasService,
               private preguntasHistorialService: PreguntasHistorialService,
               private router: Router,
               private route: ActivatedRoute,
               private fb: FormBuilder,
               private fb2: FormBuilder,
               private fb3: FormBuilder,
               private modalService: NgbModal,
               private alergenosService: AlergenosService,
               private patologiasProcedimientosService: PatologiasProcedimientosService,
               private vacunasService: VacunasService) { 
    this.crearFormulario();
  }              

  ngOnInit() {
   
    const id = this.route.snapshot.paramMap.get('id');
    this.obtenerParametros();
    this.listarAreas();
    this.listarCarreras();
    this.listarDepartamentos();
    this.listarDependencias();
    this.listarEstamentos();
    this.listarAlergenos();
    this.listarPatologiasProcedimientos();
    this.listarPatologiasFamiliares();
    this.listarVacunas();    

    if ( id !== 'nuevo' ) {

      this.pacientesService.getPaciente( Number(id) )
        .subscribe( (resp: PacienteModelo) => {  
          this.pacienteForm.patchValue(resp);
          this.pacienteForm.get('personas').get('personaId').disable();
          var cedula = this.pacienteForm.get('personas').get('cedula').value;
          this.ageCalculator();

          if( resp.personas.foto ){
            this.profile = resp.personas.foto;
          }else {
            this.profile = "assets/images/profile.jpg";
          }
      });

      var historialClinico: HistorialClinicoModelo = new HistorialClinicoModelo();
      historialClinico.areas = null;
      historialClinico.pacienteId = Number(id);
  
      this.historialClinicosService.buscarHistorialClinicosFiltros( historialClinico )
        .subscribe( ( resp : HistorialClinicoModelo[] )  => {
          if( resp.length > 0 ){      
            this.historialClinicoForm.patchValue(resp[0]);
            if( resp[0].pacienteId &&  resp[0].pacienteId ){
              this.hcid = this.historialClinicoForm.get('historialClinicoId').value;
              var cedula = this.pacienteForm.get('personas').get('cedula').value;
              this.fileInfosHistorialClinico = this.uploadService.getFilesName(cedula + '_' + this.hcid + '_', "HC");

              this.obtenerPreguntasSeleccionadas();              
            }
          }else{
            this.listarPreguntas(); 
          }          
      });

      this.obtenerAntecedentesSeleccionados(id);
      this.obtenerAlergiasSeleccionados(id);
      this.obtenerAntecedentesFamiliaresSeleccionados(id);
      this.obtenerVacunasSeleccionadas(id);      

    }else{
      this.crear = true; 
      this.listarPreguntas();     
    }

    this.crearTablaModel();
  }

  obtenerAntecedentesSeleccionados(pacienteId) {
    var antecedente = new AntecedenteModelo();

    this.antecedentes = [];

    antecedente.pacienteId = pacienteId;
    antecedente.tipo = "P";//antecedentes personales
    this.antecedentesService.buscarAntecedentesFiltros(antecedente)
    .subscribe( (resp : AntecedenteModelo[] ) => {
      this.antecedentes = resp;
      for (let i = 0; i < this.antecedentes.length; i++) {
        this.patologiasProcedimientosSeleccionados.push(this.antecedentes[i].patologiasProcedimientos.patologiaProcedimientoId);
      }      
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  obtenerAlergiasSeleccionados(pacienteId) {
    var alergias = new AlergiaModelo();

    this.alergias = [];

    alergias.pacienteId = pacienteId;

    this.alergiaService.buscarAlergiasFiltros(alergias)
    .subscribe( ( resp : AlergiaModelo[] ) => {
      this.alergias = resp; 
      for (let i = 0; i < this.alergias.length; i++) {
        this.alergenosSeleccionados.push(this.alergias[i].alergenos.alergenoId);
      }
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      this.cargando = false;
    });
  }

  obtenerAntecedentesFamiliaresSeleccionados(pacienteId) {
    var antecedente = new AntecedenteModelo();

    this.antecedentesFamiliares = [];

    antecedente.pacienteId = pacienteId;
    antecedente.tipo = "F";//antecedentes familiares
    this.antecedentesService.buscarAntecedentesFiltros(antecedente)
    .subscribe( ( resp : AntecedenteModelo[] ) => {
      this.antecedentesFamiliares = resp;
      for (let i = 0; i < this.antecedentesFamiliares.length; i++) {
        this.patologiasFamiliaresSeleccionados.push(this.antecedentesFamiliares[i].patologiasProcedimientos.patologiaProcedimientoId);
      }
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  obtenerVacunasSeleccionadas(pacienteId) {
    var vacunacion = new VacunacionModelo();

    this.vacunaciones = [];

    vacunacion.pacienteId = pacienteId;
    this.vacunacionesService.buscarVacunacionesFiltrosTabla(vacunacion)
    .subscribe( ( resp : VacunacionModelo[] ) => {
      this.vacunaciones = resp;
      for (let i = 0; i < this.vacunaciones.length; i++) {
        this.vacunasSeleccionadas.push(this.vacunaciones[i].vacunas.vacunaId);
      }
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  obtenerPreguntasSeleccionadas() {
    var preguntaHistorial = new PreguntaHistorialModelo();

    this.preguntas = [];

    preguntaHistorial.historialClinicoId = this.hcid;
    this.preguntasHistorialService.buscarPreguntasHistorialFiltrosTabla(preguntaHistorial)
    .subscribe( ( resp : PreguntaHistorialModelo[] ) => {
      this.preguntasHistorial = resp;
      for (let i = 0; i < this.preguntasHistorial.length; i++) {
        this.preguntasSeleccionadas.push(this.preguntasHistorial[i].preguntas);
      }

      this.listarPreguntas();

    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  selectFile(event) {
    this.progress = 0;
    this.selectedFiles = event.target.files;
  }

  selectFileHistorialClinico(event) {
    this.progressHistorialClinico = 0;
    this.selectedFilesHistorialClinico = event.target.files;
  }

  descargar(url,event) {
    event.preventDefault();
    console.log(url);
    let posicion = url.indexOf("files");
    console.log(posicion);
    var fileName = url.slice(posicion + 6);
    console.log(fileName);
    this.uploadService.getFilesServer(fileName);    
  }

  myUploader(event) {
    console.log(event.files[0])
    this.size = event.files[0].size;
    this.nombre =  event.files[0].name;
    let fileReader = new FileReader();
    for (let file of event.files) {
      fileReader.readAsDataURL(file);
      fileReader.onload =  () => {
        this.profile = fileReader.result
      }
    }
  }

  listarAreas() {
    var orderBy = "descripcion";
    var orderDir = "asc";
    var area = new AreaModelo();
    area.estado = "A";

    this.areasService.buscarAreasFiltros(area, orderBy, orderDir )
      .subscribe( (resp: AreaModelo) => {
        this.listaAreas = resp;
    });
  }

  listarAlergenos() {
    var orderBy = "descripcion";
    var orderDir = "asc";
    var alergeno = new AlergenoModelo();
    alergeno.estado = "A";

    this.alergenosService.buscarAlergenosFiltrosOrder(alergeno, orderBy, orderDir)
    .subscribe( (resp: AlergenoModelo[]) => {

      this.alergenos = resp;
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  listarPatologiasProcedimientos() {
    var orderBy = "descripcion";
    var orderDir = "asc";
    var patologiaProcedimiento = new PatologiaProcedimientoModelo();
    patologiaProcedimiento.estado = "A";

    this.patologiasProcedimientosService.
    buscarPatologiasProcedimientosFiltrosTablaOrder(patologiaProcedimiento, orderBy, orderDir)
    .subscribe( (resp: PatologiaProcedimientoModelo[]) => {

      this.patologiasProcedimientos = resp;
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  listarPatologiasFamiliares() {
    var orderBy = "descripcion";
    var orderDir = "asc";
    var patologia = new PatologiaProcedimientoModelo();
    patologia.estado = "A";
    patologia.tipo = "PAT";

    this.patologiasProcedimientosService.
    buscarPatologiasProcedimientosFiltrosTablaOrder(patologia, orderBy, orderDir)
    .subscribe( (resp: PatologiaProcedimientoModelo[]) => {

      this.patologiasFamiliares = resp;
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  listarVacunas() {
    var orderBy = "descripcion";
    var orderDir = "asc";
    var vacuna = new VacunaModelo();
    vacuna.estado = "A";

    this.vacunasService.buscarVacunasFiltrosTablaOrder(vacuna, orderBy, orderDir)
    .subscribe( (resp: VacunaModelo[]) => {

      this.vacunas = resp;
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  listarPreguntas() {
    var orderBy = "numero";
    var orderDir = "asc";
    var pregunta = new PreguntaModelo();
    pregunta.estado = "A";

    this.preguntasService.buscarPreguntasFiltrosTablaOrder(pregunta, orderBy, orderDir)
    .subscribe( (resp: PreguntaModelo[]) => {

      this.preguntas = resp;
    }, e => {      
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
    });
  }

  onCheckChangeAlergeno(event) {
    
    if(event.target.checked){
     
      this.alergenosSeleccionados.push(event.target.value);
    }
    else{     
      for (let i = 0; i < this.alergenosSeleccionados.length; i++) {
        if(this.alergenosSeleccionados[i] == event.target.value) {
          this.alergenosSeleccionados.splice(i, 1); 
          return;
        }
      }
    }
  }

  onCheckChangePatologiaProcedimiento(event) {  
    if(event.target.checked){     
      this.patologiasProcedimientosSeleccionados.push(event.target.value);
    }
    else{
      for (let i = 0; i < this.patologiasProcedimientosSeleccionados.length; i++) {
        if(this.patologiasProcedimientosSeleccionados[i] == event.target.value) {
          this.patologiasProcedimientosSeleccionados.splice(i, 1); 
          return;
        }
      }
    }
  }

  onCheckChangePatologiaFamiliar(event) {  
    if(event.target.checked){     
      this.patologiasFamiliaresSeleccionados.push(event.target.value);
    }
    else{
      for (let i = 0; i < this.patologiasFamiliaresSeleccionados.length; i++) {
        if(this.patologiasFamiliaresSeleccionados[i] == event.target.value) {
          this.patologiasFamiliaresSeleccionados.splice(i, 1); 
          return;
        }
      }
    }
  }

  onCheckChangeVacuna(event) {  
    if(event.target.checked){     
      this.vacunasSeleccionadas.push(event.target.value);
    }
    else{
      for (let i = 0; i < this.vacunasSeleccionadas.length; i++) {
        if(this.vacunasSeleccionadas[i] == event.target.value) {
          this.vacunasSeleccionadas.splice(i, 1); 
          return;
        }
      }
    }
  }

  onCheckPregunta(event, pregunta) {  
    if(event){     
      pregunta.valor = 'S'
      this.preguntasSeleccionadas.push(pregunta);
    }
    else{
      for (let i = 0; i < this.preguntasSeleccionadas.length; i++) {
        if(this.preguntasSeleccionadas[i].preguntaId == pregunta.preguntaId) {
          this.preguntasSeleccionadas.splice(i, 1); 
          return;
        }
      }
    }
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
    
    var grupoSanguineoParam = new ParametroModelo();
    grupoSanguineoParam.codigoParametro = "GRUPO_SANGUINEO";
    grupoSanguineoParam.estado = "A";

    this.parametrosService.buscarParametrosFiltros( grupoSanguineoParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo) => {
        this.listaGrupoSanguineo = resp;
    });
  }

  obtenerPersona(event){
    event.preventDefault();
    var id = this.pacienteForm.get('personas').get('personaId').value;    
    if(!id){
      return null;
    }
    this.pacientesService.getPersona( id )
      .subscribe( (resp: PersonaModelo) => {
        this.pacienteForm.get('personas').patchValue(resp);
        this.pacienteForm.get('personas').disable();
        this.ageCalculator();
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
          this.pacienteForm.get('personas').get('personaId').setValue(null);
        }
      );
  }

  buscarPersona(event){
    event.preventDefault();
    var cedula = this.pacienteForm.get('personas').get('cedula').value;    
    if(!cedula){
      return null;
    }
    var persona: PersonaModelo = new PersonaModelo();
    persona.cedula = cedula;
    this.personasService.buscarPersonasFiltros( persona )
      .subscribe( (resp : PersonaModelo[] ) => {
        if(resp.length > 0 ){
          this.pacienteForm.get('personas').patchValue(resp[0]);
          this.pacienteForm.get('personas').disable();
          this.ageCalculator();
          this.validarPaciente();
        }
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e)
          })
          this.pacienteForm.get('personas').get('personaId').setValue(null);
        }
      );
  }

  validarPaciente(){
    var persona: PersonaModelo = new PersonaModelo();
    var buscadorPaciente: PacienteModelo = new PacienteModelo();

    persona.cedula = this.pacienteForm.get('personas').get('cedula').value; 
    buscadorPaciente.personas = persona;
    
    this.pacientesService.buscarPacientesFiltros(buscadorPaciente)
    .subscribe( ( resp : PacienteModelo[] ) => {
      if(resp && resp.length > 0){
        Swal.fire({
          icon: 'info',
          title: 'Atención',
          text: 'La persona con cédula '+ this.pacienteForm.get('personas').get('cedula').value +' ya ha sido registrada como paciente'
        });
      }
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

  guardar(  ) {
    try {
          
      if ( this.pacienteForm.invalid ){
        this.alertGuardar = true;
        return Object.values( this.pacienteForm.controls ).forEach( control => {
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

      var procesoPacienteHistorialClinico = new ProcesoPacienteHistorialClinicoModelo();
      var historialClinico: HistorialClinicoModelo = new HistorialClinicoModelo();
      
      let peticion: Observable<any>; 
      var paciente: PacienteModelo = new PacienteModelo();
      paciente = this.pacienteForm.getRawValue();

      if ( paciente.personas.carreras != null && paciente.personas.carreras.carreraId == null ){
        paciente.personas.carreras = null;
      }
      if ( paciente.personas.departamentos != null && paciente.personas.departamentos.departamentoId == null ){
        paciente.personas.departamentos = null;
      }
      if ( paciente.personas.dependencias != null && paciente.personas.dependencias.dependenciaId == null ){
        paciente.personas.dependencias = null;
      }
      if ( paciente.personas.estamentos != null && paciente.personas.estamentos.estamentoId == null ){
        paciente.personas.estamentos = null;
      }

      if(this.profile!="" && this.profile != "assets/images/profile.jpg"){
        paciente.personas.foto = this.profile;
      }
      
      historialClinico = this.historialClinicoForm.getRawValue();

      historialClinico.pacienteId = paciente.pacienteId;
      historialClinico.usuarioCreacion = this.tokenService.getUserName().toString();
      historialClinico.areas = null;

      procesoPacienteHistorialClinico.paciente = paciente;
      procesoPacienteHistorialClinico.historialClinico = historialClinico;
      procesoPacienteHistorialClinico.alergenosIdList = this.alergenosSeleccionados;
      procesoPacienteHistorialClinico.patologiasProcedimientosIdList = this.patologiasProcedimientosSeleccionados;
      procesoPacienteHistorialClinico.patologiasFamiliaresIdList = this.patologiasFamiliaresSeleccionados;
      procesoPacienteHistorialClinico.vacunasIdList = this.vacunasSeleccionadas;
      procesoPacienteHistorialClinico.preguntasList = this.preguntasSeleccionadas;
      
      if ( paciente.pacienteId ) {
        paciente.personas.usuarioModificacion = this.tokenService.getUserName().toString();
        paciente.usuarioModificacion = this.tokenService.getUserName().toString();
        peticion = this.pacientesService.actualizarPacienteHistorialClinico( procesoPacienteHistorialClinico );
      } else {
        if(!paciente.personas.personaId){
          paciente.personas.usuarioCreacion = this.tokenService.getUserName().toString();
        }
        paciente.usuarioCreacion = this.tokenService.getUserName().toString();
        peticion = this.pacientesService.crearPacienteHistorialClinico( procesoPacienteHistorialClinico );
      }

      peticion.subscribe( resp => {
        
        //guardar el historial clinico digitalizado
        var mensajeUploadHistorialClinico = '';
        if(this.selectedFilesHistorialClinico){
          var cedula = resp.paciente.personas.cedula;
          var areaId = this.historialClinicoForm.get('areas').get('areaId').value;
          this.currentFileHistorialClinico = this.selectedFilesHistorialClinico.item(0);

          var archivo = this.currentFileHistorialClinico.name.split(".")[0];
          var tipo = this.currentFileHistorialClinico.name.split(".")[1];

          var filename = cedula + '_' + this.hcid + '_' + archivo;
          if (tipo) filename = filename + '_' + tipo;
          
          var renameFile = new File([this.currentFileHistorialClinico], filename, {type:this.currentFileHistorialClinico.type});

          this.uploadService.upload2(renameFile, "HC").subscribe(
            event => {
              mensajeUploadHistorialClinico;
              console.log("Archivo subido con exito");
            },
            err => {
              mensajeUploadHistorialClinico = 'No se pudo subir el archivo!' + this.comunes.obtenerError(err);
              console.log(mensajeUploadHistorialClinico);
          });

          this.selectedFilesHistorialClinico = undefined;
        }

        Swal.fire({
                  icon: 'success',
                  title: paciente.personas.nombres +' '+paciente.personas.apellidos,
                  text: resp.mensaje
                }).then( resp => {

          if ( resp.value ) {
            if ( paciente.pacienteId ) {
              this.router.navigate(['/pacientes']);
            }else{
              this.limpiar(event);
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
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Algo salió mal'
      })  
    }
  }

  ageCalculator(){
    var fechaNacimiento = this.pacienteForm.get('personas').get('fechaNacimiento').value;//toString();
    if( fechaNacimiento ){
      const convertAge = new Date(fechaNacimiento);
      const timeDiff = Math.abs(Date.now() - convertAge.getTime());

      this.pacienteForm.get('personas').get('edad').setValue(Math.floor((timeDiff / (1000 * 3600 * 24))/365));
    }
  }

  limpiar(event){
    event.preventDefault();
    this.pacienteForm.reset();
    this.pacienteForm.get('personas').enable();
  }

  obtenerError(e : any){
    var mensaje = "Error indefinido ";
    if(e.error){
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
    }
    if(e.message){
      mensaje = mensaje + ' ' + e.message;
    }
    return mensaje;  
  }

  get personaIdNoValido() {
    return this.pacienteForm.get('personas').get('personaId').invalid 
      && this.pacienteForm.get('personas').get('personaId').touched
  }

  get areaNoValido() {
    return this.historialClinicoForm.get('areas').get('areaId').invalid 
    && this.historialClinicoForm.get('areas').get('areaId').touched
  }

  get cedulaNoValido() {
    return this.pacienteForm.get('personas').get('cedula').invalid 
    && this.pacienteForm.get('personas').get('cedula').touched
  }

  get nombreNoValido() {
    return this.pacienteForm.get('personas').get('nombres').invalid 
    && this.pacienteForm.get('personas').get('nombres').touched
  }

  get apellidoNoValido() {
    return this.pacienteForm.get('personas').get('apellidos').invalid 
    && this.pacienteForm.get('personas').get('apellidos').touched
  }

  get correoNoValido() {
    return this.pacienteForm.get('personas').get('email').invalid 
    && this.pacienteForm.get('personas').get('email').touched
  }

  get grupoSanguineoNoValido() {
    return this.pacienteForm.get('grupoSanguineo').invalid 
    && this.pacienteForm.get('grupoSanguineo').touched
  }

  crearFormulario() {
    this.pacienteForm = this.fb.group({
      pacienteId  : [null, [] ],
      personas : this.fb.group({
        personaId  : [null, [] ],
        cedula  : [null, [ Validators.required]  ],
        nombres  : [null, [ Validators.required]  ],
        apellidos: [null, [Validators.required] ],
        fechaNacimiento: [null, [] ],
        lugarNacimiento: [null, [] ],
        edad: [null, [] ],
        direccion: [null, [] ],
        profesion: [null, [] ],
        sexo: [null, [] ],
        estadoCivil: [null, [] ],
        nacionalidad: [null, [] ],
        telefono: [null, [] ],
        email  : [null, [ Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')] ],
        celular: [null, [] ],
        observacion: [null, [] ],
        carreras: this.fb.group({
          carreraId: [null, [] ]
        }),
        departamentos: this.fb.group({
          departamentoId: [null, [] ]
        }),
        dependencias: this.fb.group({
          dependenciaId: [null, [] ]
        }),
        estamentos: this.fb.group({
          estamentoId: [null, [] ]
        }),  
        fechaCreacion: [null, [] ],
        fechaModificacion: [null, [] ],
        usuarioCreacion: [null, [] ],
        usuarioModificacion: [null, [] ]   
      }),      
      grupoSanguineo  : [null, [Validators.required] ],
      seguroMedico  : [null, [] ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ]            
    });
    
    this.buscadorForm = this.fb2.group({
      cedula  : ['', [] ],
      nombres  : ['', [] ],
      apellidos: ['', [] ]   
    });

    this.historialClinicoForm = this.fb3.group({
      historialClinicoId  : [null, [] ],
      areas: this.fb3.group({     
        areaId  : [null, [Validators.required] ]
      }),
      patologiaActual  : [null, [] ],
      tratamientoActual  : [null, [] ],      
      opcion6  : [null, [] ],
      opcion7  : [null, [] ],
      opcion8: [null, [] ],
      opcion9: [null, [] ],
      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ]    
    });

    this.pacienteForm.get('pacienteId').disable();
    this.pacienteForm.get('personas').get('fechaCreacion').disable();
    this.pacienteForm.get('personas').get('fechaModificacion').disable();
    this.pacienteForm.get('personas').get('usuarioCreacion').disable();
    this.pacienteForm.get('personas').get('usuarioModificacion').disable();

    this.historialClinicoForm.get('historialClinicoId').disable();
    this.historialClinicoForm.get('areas').get('areaId').disable();

    this.pacienteForm.get('fechaCreacion').disable();
    this.pacienteForm.get('fechaModificacion').disable();
    this.pacienteForm.get('usuarioCreacion').disable();
    this.pacienteForm.get('usuarioModificacion').disable();

    this.historialClinicoForm.get('fechaCreacion').disable();
    this.historialClinicoForm.get('fechaModificacion').disable();
    this.historialClinicoForm.get('usuarioCreacion').disable();
    this.historialClinicoForm.get('usuarioModificacion').disable();
  }

  buscadorPersonas(event) {
    event.preventDefault();
    
    var buscador = new PersonaModelo();
    buscador.cedula = this.buscadorForm.get('cedula').value;
    buscador.nombres = this.buscadorForm.get('nombres').value;
    buscador.apellidos = this.buscadorForm.get('apellidos').value;
    
    if(!buscador.cedula && !buscador.nombres
      && !buscador.apellidos){
      this.alert=true;
      return;
    }
    this.cargando = true;
    this.personasService.buscarPersonasFiltros(buscador)
    .subscribe( ( resp : PersonaModelo[] ) => {
      this.personas = resp;
      this.cargando = false;
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      this.cargando = false;
    });
  }

  getCheckedAntecedentes(patologiaProcedimientoId) {

    for (let i = 0; i < this.antecedentes.length; i++) {
      if(this.antecedentes[i].patologiasProcedimientos.patologiaProcedimientoId == patologiaProcedimientoId) {        
        return true;
      }
    }
    return false;
  }

  getCheckedAlergias(alergenoId) {

    for (let i = 0; i < this.alergias.length; i++) {
      if(this.alergias[i].alergenos.alergenoId == alergenoId) {        
        return true;
      }
    }
    return false;
  }

  getCheckedAntecedentesFamiliares(patologiaProcedimientoId) {

    for (let i = 0; i < this.antecedentesFamiliares.length; i++) {
      if(this.antecedentesFamiliares[i].patologiasProcedimientos.patologiaProcedimientoId == patologiaProcedimientoId) {        
        return true;
      }
    }
    return false;
  }

  getCheckedVacunaciones(vacunaId) {

    for (let i = 0; i < this.vacunaciones.length; i++) {
      if(this.vacunaciones[i].vacunas.vacunaId == vacunaId) {        
        return true;
      }
    }
    return false;
  }

  getCheckedPreguntas(pregunta) {

    for (let i = 0; i < this.preguntasSeleccionadas.length; i++) {
      if(this.preguntasSeleccionadas[i].preguntaId == pregunta.preguntaId) {        
        return true;
      }
    }
    return false;
  }

  limpiarModal(event) {
    event.preventDefault();
    this.buscadorForm.reset();
    this.personas = [];
  }

  cerrarAlert(){
    this.alert=false;
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
      columns: [ { data: 'personaId' }, { data: 'cedula' }, 
      { data: 'nombres' }, { data: 'apellidos' }]      
    };
  }

  openModal(targetModal) {
    this.modalService.open(targetModal, {
     centered: true,
     backdrop: 'static',
     size: 'lg'
    });
   
    this.buscadorForm.patchValue({
      cedula: '',
      nombres: '',
      apellidos: ''
    });
    this.personas = [];
    this.alert=false;
  }

  selectPersona(event, persona: PersonaModelo){
    this.modalService.dismissAll();
    if(persona.personaId){
      this.pacienteForm.get('personas').get('personaId').setValue(persona.personaId);
    }
    this.pacientesService.getPersona( persona.personaId )
      .subscribe( (resp: PersonaModelo) => {
        this.pacienteForm.get('personas').patchValue(resp);
      }, e => {
          Swal.fire({
            icon: 'info',
            text: this.comunes.obtenerError(e),
          })
          this.pacienteForm.get('personas').get('personaId').setValue(null);
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
