import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ComunesService } from '../../../servicios/comunes.service';
import Swal from 'sweetalert2';
import { UploadFileService } from 'src/app/servicios/upload-file.service';
import { GlobalConstants } from 'src/app/common/global-constants';
import { TokenService } from 'src/app/servicios/token.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-ayuda',
  templateUrl: './ayuda.component.html',
  styleUrls: ['./ayuda.component.css']
})
export class AyudaComponent implements OnInit {

  ayudaForm: FormGroup;
  progress = 0;
  selectedFiles: FileList;
  progressAyuda = 0;
  selectedFilesAyuda: FileList;
  currentFileAyuda: File;
  fileInfosAyuda: Observable<any>;
  rolesUsuario: Array<String> = [];
  ocultarSubirArchivo:boolean=true;
  alert:boolean=false;
  message: String = null;

  constructor( private tokenService: TokenService,
               private comunes: ComunesService,
               private uploadService: UploadFileService,
               private fb: FormBuilder ) { 
    this.crearFormulario();
  }              

  ngOnInit() {   
    this.verificarRoles();
    this.listarArchivos();
    this.ayudaForm.get('tipo').setValue('publico');
  }  

  verificarRoles(){
    for (let i = 0; i < this.tokenService.roles.length; i++) {
      this.rolesUsuario.push(this.tokenService.roles[i].toString());
    }

    if(this.rolesUsuario.includes(GlobalConstants.ROL_ABM_AYUDA)
      || this.rolesUsuario.includes(GlobalConstants.ROL_ADMIN)){
        this.ocultarSubirArchivo= false;
    }
  }

  listarArchivos(){
    var tipoArchivo = "publico";
    if(this.rolesUsuario.includes(GlobalConstants.ROL_ABM_AYUDA)
      || this.rolesUsuario.includes(GlobalConstants.ROL_ADMIN)){
        this.fileInfosAyuda = this.uploadService.getFiles("AR");
    }else{
      this.fileInfosAyuda = this.uploadService.getFilesName(tipoArchivo + '_', "AR");
    }  
  }

  guardar( ) {
    this.cerrarAlert();
    var ayuda = this.ayudaForm.getRawValue();
   
    if(this.selectedFilesAyuda && this.selectFileAyuda.length > 0){
      this.currentFileAyuda = this.selectedFilesAyuda.item(0);

      var archivo = this.currentFileAyuda.name.split(".")[0];
      var tipo = this.currentFileAyuda.name.split(".")[1];

      var filename = archivo;
      if (tipo) filename = ayuda.tipo + "_" + filename + '_' + tipo;
      
      var renameFile = new File([this.currentFileAyuda], filename, {type:this.currentFileAyuda.type});

      this.uploadService.upload2(renameFile, "AR").subscribe(
        event => {
          Swal.fire({
            icon: 'success',
            text: 'Archivo subido con exito'
          })
          this.listarArchivos();
        },
        err => {
          Swal.fire({
            icon: 'info',
            title: 'No se pudo subir el archivo!',
            text:  this.comunes.obtenerError(err)
          })
      });

      this.ngOnInit();
    }else{
      this.alert = true;
      this.message = "No se ha seleccionado ningun archivo";      
    }
  }

  limpiar(){
    this.ayudaForm.reset();    
  }

  cerrarAlert(){
    this.alert=false;
  }
  
  crearFormulario() {
    this.ayudaForm = this.fb.group({
      tipo  : [null, [] ]    
    });
  }

  selectFile(event) {
    this.progress = 0;
    this.selectedFiles = event.target.files;
  }

  selectFileAyuda(event) {
    this.progressAyuda = 0;
    this.selectedFilesAyuda = event.target.files;
  }

}
