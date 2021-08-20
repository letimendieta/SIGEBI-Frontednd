import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { FichaClinicaModelo } from '../../../modelos/fichaClinica.modelo';
import { FichasClinicasService } from '../../../servicios/fichasClinicas.service';
import { ComunesService } from 'src/app/servicios/comunes.service';
import Swal from 'sweetalert2';
import { AlergenosService } from 'src/app/servicios/alergenos.service';
import { AlergenoModelo } from 'src/app/modelos/alergeno.modelo';
import { PatologiasProcedimientosService } from 'src/app/servicios/patologiasProcedimientos.service';
import { PatologiaProcedimientoModelo } from 'src/app/modelos/patologiaProcedimiento.modelo';
import { VacunacionModelo } from 'src/app/modelos/vacunacion.modelo';
import { VacunaModelo } from 'src/app/modelos/vacuna.modelo';
import { VacunasService } from 'src/app/servicios/vacunas.service';

@Component({
  selector: 'app-fichaClinica',
  templateUrl: './fichaClinica.component.html',
  styleUrls: ['./fichaClinica.component.css']
})
export class FichaClinicaComponent implements OnInit {
  crear = false;
  fichaClinicaForm: FormGroup;
  alertGuardar:boolean=false;
  fichaClinica: FichaClinicaModelo = new FichaClinicaModelo();
  patologiasProcedimientos: PatologiaProcedimientoModelo[] = [];
  patologiasFamiliares: PatologiaProcedimientoModelo[] = [];
  vacunas: VacunaModelo[] = [];
  alergenos: AlergenoModelo[] = [];
  alergenosSeleccionados: number[] = [];
  patologiasProcedimientosSeleccionados: number[] = [];
  patologiasFamiliaresSeleccionados: number[] = [];
  vacunasSeleccionadas: number[] = [];

  constructor( private fichasClinicasService: FichasClinicasService,
               private route: ActivatedRoute,
               private comunes: ComunesService,
               private router: Router,
               private alergenosService: AlergenosService,
               private patologiasProcedimientosService: PatologiasProcedimientosService,
               private vacunasService: VacunasService,
               private fb: FormBuilder) { 
    this.crearFormulario();
  }              

  ngOnInit() {

    this.listarAlergenos();
    this.listarPatologiasProcedimientos();
    this.listarPatologiasFamiliares();
    this.listarVacunas();
    this.crear = true;
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

  guardar( ) {

    /*if ( this.fichaClinicaForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.fichaClinicaForm.controls ).forEach( control => {

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
    Swal.showLoading();*/

    this.alergenosSeleccionados;
    this.patologiasProcedimientosSeleccionados;
    this.patologiasFamiliaresSeleccionados;
    this.vacunasSeleccionadas;

    let peticion: Observable<any>;

    /*this.fichaClinica = this.fichaClinicaForm.getRawValue();

    if ( this.fichaClinica.fichaClinicaId ) {
      //Modificar
      this.fichaClinica.usuarioModificacion = 'admin';
      peticion = this.fichasClinicasService.actualizarFichaClinica( this.fichaClinica );
    } else {
      //Agregar
      this.fichaClinica.usuarioCreacion = 'admin';
      peticion = this.fichasClinicasService.crearFichaClinica( this.fichaClinica );
    }

    peticion.subscribe( resp => {

      Swal.fire({
                icon: 'success',
                title: this.fichaClinica.codigo,
                text: resp.mensaje,
              }).then( resp => {

        if ( resp.value ) {
          if ( this.fichaClinica.fichaClinicaId ) {
            this.router.navigate(['/fichasClinicas']);
          }else{
            this.limpiar();
          }
        }

      });
    }, e => {Swal.fire({
              icon: 'error',
              title: 'Algo salió mal',
              text: e.status +'. '+ this.comunes.obtenerError(e),
            })
       }
    );*/
  }

  limpiar(){
    //this.fichaClinica = new FichaClinicaModelo();
    //this.fichaClinicaForm.reset();
    //this.fichaClinicaForm.get('estado').setValue('A');
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

  /*get codigoNoValido() {
    return this.fichaClinicaForm.get('codigo').invalid && this.fichaClinicaForm.get('codigo').touched
  }

  get descripcionNoValido() {
    return this.fichaClinicaForm.get('descripcion').invalid && this.fichaClinicaForm.get('descripcion').touched
  }*/

  crearFormulario() {

    this.fichaClinicaForm = this.fb.group({
      fichaClinicaId  : [null, [] ],
      
      opcion6  : [null, [] ],
      opcion7  : [null, [] ],
      opcion8: [null, [] ],
      opcion9: [null, [] ],

      fechaCreacion: [null, [] ],
      fechaModificacion: [null, [] ],
      usuarioCreacion: [null, [] ],
      usuarioModificacion: [null, [] ]    
    });

    this.fichaClinicaForm.get('fichaClinicaId').disable();
    this.fichaClinicaForm.get('fechaCreacion').disable();
    this.fichaClinicaForm.get('fechaModificacion').disable();
    this.fichaClinicaForm.get('usuarioCreacion').disable();
    this.fichaClinicaForm.get('usuarioModificacion').disable();
  }
  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }
}
