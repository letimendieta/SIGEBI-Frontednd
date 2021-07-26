import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Reporte2Modelo } from '../../../modelos/reporte2.modelo';
import { ReportesService } from '../../../servicios/reportes.service';
import { ComunesService } from '../../../servicios/comunes.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {

  crear = false;
  reporteForm: FormGroup;
  alertGuardar:boolean=false;

  constructor( private reportesService: ReportesService,
               private route: ActivatedRoute,
               private comunes: ComunesService,
               private router: Router,
               private fb: FormBuilder ) { 
    this.crearFormulario();
  }              

  ngOnInit() {    
    this.crear = true;    
  }  

  guardar( ) {

    if ( this.reporteForm.invalid ) {
      this.alertGuardar = true;
      return Object.values( this.reporteForm.controls ).forEach( control => {

        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    }
    
    var reporte = new Reporte2Modelo();

    reporte = this.reporteForm.getRawValue();

    Swal.fire({
      title: 'Espere',
      text: 'Generando reporte',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    this.reportesService.generarReporte(reporte).subscribe(
      data => {
        Swal.fire({
          icon: 'success',
          title: 'Reporte ',
          text: 'reporte generado'
        }).then( resp => {
          const file = new Blob([data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);
        if ( resp.value ) {     
            this.limpiar();
        }
      });  
      }, e => {      
        Swal.fire({
          icon: 'info',
          title: 'Algo salió mal',
          text: this.comunes.obtenerError(e)
        })
      });
  }

  limpiar(){
    this.reporteForm.reset();
    
  }
  
  crearFormulario() {
    this.reporteForm = this.fb.group({
      mes  : [null, [] ],      
      anho: [null, [] ]       
    });
  }

  cerrarAlertGuardar(){
    this.alertGuardar=false;
  }  
}
