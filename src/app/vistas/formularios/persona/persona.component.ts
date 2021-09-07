import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { PersonaModelo } from '../../../modelos/persona.modelo';
import { ParametroModelo } from '../../../modelos/parametro.modelo';
import { CarreraModelo } from '../../../modelos/carrera.modelo';
import { DepartamentoModelo } from '../../../modelos/departamento.modelo';
import { DependenciaModelo } from '../../../modelos/dependencia.modelo';
import { EstamentoModelo } from '../../../modelos/estamento.modelo';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { PersonasService } from '../../../servicios/personas.service';
import { ParametrosService } from '../../../servicios/parametros.service';
import { CarrerasService } from '../../../servicios/carreras.service';
import { DepartamentosService } from '../../../servicios/departamentos.service';
import { DependenciasService } from '../../../servicios/dependencias.service';
import { EstamentosService } from '../../../servicios/estamentos.service';
import { UploadFileService } from 'src/app/servicios/upload-file.service';

import Swal from 'sweetalert2';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-persona',
  templateUrl: './persona.component.html',
  styleUrls: ['./persona.component.css']
})
export class PersonaComponent implements OnInit {
  crear = false;
  personaForm: FormGroup;
  listaEstadoCivil: ParametroModelo;
  listaSexo: ParametroModelo;
  listaNacionalidad: ParametroModelo;
  listaCarreras: CarreraModelo;
  listaDepartamentos: DepartamentoModelo;
  listaDependencias: DependenciaModelo;
  listaEstamentos: EstamentoModelo;
  alertGuardar:boolean=false;
  selectedFiles: FileList;
  currentFile: File;
  progress = 0;
  message = '';  
  fileInfos: Observable<any>;
  profile: any = "assets/images/profile.jpg";
  size:any=0;
  nombre:any = "";

  constructor( private tokenService: TokenService,
               private personasService: PersonasService,
               private parametrosService: ParametrosService,
               private carrerasService: CarrerasService,
               private departamentosService: DepartamentosService,
               private comunes: ComunesService,
               private dependenciasService: DependenciasService,
               private estamentosService: EstamentosService,
               private uploadService: UploadFileService,
               private router: Router,
               private route: ActivatedRoute, 
               private fb: FormBuilder ) { 
    this.crearFormulario();
  }              

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.obtenerParametros();
    this.listarCarreras();
    this.listarDepartamentos();
    this.listarDependencias();
    this.listarEstamentos();

    if ( id !== 'nuevo' ) {
      
      this.personasService.getPersona( Number(id) )
        .subscribe( (resp: PersonaModelo) => {
          this.personaForm.patchValue(resp);
          this.ageCalculator();

          if( resp.foto ){
            this.profile = resp.foto;
          }else {
            this.profile = "assets/images/profile.jpg";
          }
        });
    }else{
      this.crear = true;
    }
  }

  selectFile(event) {
    this.progress = 0;
    this.selectedFiles = event.target.files;
  }

  obtenerParametros() {
    var estadoCivilParam = new ParametroModelo();
    estadoCivilParam.codigoParametro = "EST_CIVIL";
    estadoCivilParam.estado = "A";
    var orderBy = "descripcionValor";
    var orderDir = "asc";

    this.parametrosService.buscarParametrosFiltrosOrder( estadoCivilParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo) => {
        this.listaEstadoCivil = resp;
    });

    var sexoParam = new ParametroModelo();
    sexoParam.codigoParametro = "SEXO";
    sexoParam.estado = "A";

    this.parametrosService.buscarParametrosFiltrosOrder( sexoParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo) => {
        this.listaSexo = resp;
    });

    var nacionalidadParam = new ParametroModelo();
    nacionalidadParam.codigoParametro = "NACIONALIDAD";
    nacionalidadParam.estado = "A";

    this.parametrosService.buscarParametrosFiltrosOrder( nacionalidadParam, orderBy, orderDir )
      .subscribe( (resp: ParametroModelo) => {
        this.listaNacionalidad = resp;
    });
    
  }

  listarCarreras() {
    var orderBy = "descripcion";
    var orderDir = "asc";

    this.carrerasService.buscarCarrerasFiltrosOrder(null, orderBy, orderDir )
      .subscribe( (resp: CarreraModelo) => {
        this.listaCarreras = resp;
    });
  }

  listarDepartamentos() {
    var orderBy = "descripcion";
    var orderDir = "asc";

    this.departamentosService.buscarDepartamentosFiltrosOrder(null, orderBy, orderDir )
      .subscribe( (resp: DepartamentoModelo) => {
        this.listaDepartamentos = resp;
    });
  }

  listarDependencias() {
    var orderBy = "descripcion";
    var orderDir = "asc";

    this.dependenciasService.buscarDependenciasFiltrosOrder(null, orderBy, orderDir )
      .subscribe( (resp: DependenciaModelo) => {
        this.listaDependencias = resp;
    });
  }

  listarEstamentos() {
    var orderBy = "descripcion";
    var orderDir = "asc";

    this.estamentosService.buscarEstamentosFiltrosOrder(null, orderBy, orderDir )
      .subscribe( (resp: EstamentoModelo) => {
        this.listaEstamentos = resp;
    });
  }

  guardar( ) {
    this.cerrarAlertGuardar();
    if ( this.personaForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.personaForm.controls ).forEach( control => {

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
    var persona: PersonaModelo = new PersonaModelo();
    
    persona = this.personaForm.getRawValue();
    if ( persona.carreras != null 
      && persona.carreras.carreraId == null || isNaN( persona.carreras.carreraId ) ){
      persona.carreras = null;
    }
    if ( persona.departamentos != null 
      && persona.departamentos.departamentoId == null || isNaN( persona.departamentos.departamentoId ) ){
      persona.departamentos = null;
    }
    if ( persona.dependencias != null 
      && persona.dependencias.dependenciaId == null || isNaN( persona.dependencias.dependenciaId ) ){
      persona.dependencias = null;
    }
    if ( persona.estamentos != null 
      && persona.estamentos.estamentoId == null || isNaN( persona.estamentos.estamentoId ) ){
      persona.estamentos = null;
    }

    if(this.profile!="" && this.profile != "assets/images/profile.jpg"){
        persona.foto = this.profile;
      }

    if ( persona.personaId ) {
      //Modificar
      persona.usuarioModificacion = this.tokenService.getUserName().toString();
      peticion = this.personasService.actualizarPersona( persona );
    } else {
      //Agregar
      persona.usuarioCreacion = this.tokenService.getUserName().toString();
      peticion = this.personasService.crearPersona( persona );
    }

    peticion.subscribe( resp => {

      var mensajeUpload = '';
      if(this.selectedFiles){
        var cedula = resp.persona.cedula;
        this.currentFile = this.selectedFiles.item(0);
        var filename = cedula + '_'
                      + this.currentFile.name.split(".")[0] + this.currentFile.name.split(".")[1];
        var renameFile = new File([this.currentFile], filename, {type:this.currentFile.type});

        this.uploadService.upload2(renameFile, "I").subscribe(
          event => {
            mensajeUpload
          },
          err => {
            mensajeUpload = 'No se pudo subir el archivo!' + this.comunes.obtenerError(err);
            console.log(mensajeUpload);
        });

        this.selectedFiles = undefined;
      }

      Swal.fire({
                icon: 'success',
                title: persona.nombres +' '+persona.apellidos,
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( !this.crear ) {
            this.router.navigate(['/inicio/personas']);
          }else{
            this.limpiar(event);
          }
        }
      });
    }, e => {Swal.fire({
              icon: 'error',
              title: 'Algo salió mal',
              text: this.comunes.obtenerError(e)
            })
       }
    );
  }

  buscarPersona(event){
    if( this.crear ){
    
      event.preventDefault();
      var cedula = this.personaForm.get('cedula').value;    
      if(!cedula){
        return null;
      }
      var persona: PersonaModelo = new PersonaModelo();
      persona.cedula = cedula;
      this.personasService.buscarPersonasFiltrosTabla( persona )
        .subscribe( (resp : PersonaModelo[] ) => {
          if(resp.length > 0 ){
            Swal.fire({
              icon: 'info',
              text: 'Ya existe una persona con cédula: '+ cedula
            })
          }
        }, e => {
            Swal.fire({
              icon: 'info',
              text: this.comunes.obtenerError(e)
            })
          }
        );
    }
  }

  ageCalculator(){
    var fechaNacimiento = this.personaForm.get('fechaNacimiento').value;//toString();
    if( fechaNacimiento ){
      const convertAge = new Date(fechaNacimiento);
      const timeDiff = Math.abs(Date.now() - convertAge.getTime());

      this.personaForm.get('edad').setValue(Math.floor((timeDiff / (1000 * 3600 * 24))/365));
    }
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

  limpiar(event){
    event.preventDefault();
    this.personaForm.reset();
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

  get cedulaNoValido() {
    return this.personaForm.get('cedula').invalid && this.personaForm.get('cedula').touched
  }

  get nombreNoValido() {
    return this.personaForm.get('nombres').invalid && this.personaForm.get('nombres').touched
  }

  get apellidoNoValido() {
    return this.personaForm.get('apellidos').invalid && this.personaForm.get('apellidos').touched
  }

  get correoNoValido() {
    return this.personaForm.get('email').invalid && this.personaForm.get('email').touched
  }

  crearFormulario() {

    this.personaForm = this.fb.group({
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
      observacion:[null, []],
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
      usuarioModificacion: [null, [] ],   
    });

    this.personaForm.get('personaId').disable();

    this.personaForm.get('fechaCreacion').disable();
    this.personaForm.get('fechaModificacion').disable();
    this.personaForm.get('usuarioCreacion').disable();
    this.personaForm.get('usuarioModificacion').disable();    
  }
  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
