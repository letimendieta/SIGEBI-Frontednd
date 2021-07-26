import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ParametrosService } from '../../../servicios/parametros.service';
import { ParametroModelo } from '../../../modelos/parametro.modelo';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../../common/global-constants';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { DataTableDirective } from 'angular-datatables';
import { Router } from '@angular/router';

@Component({
  selector: 'app-parametros',
  templateUrl: './parametros.component.html',
  styleUrls: ['./parametros.component.css']
})
export class ParametrosComponent implements OnDestroy, OnInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  dtOptions: any = {};
  dtTrigger : Subject<any> = new Subject<any>();

  parametros: ParametroModelo[] = [];
  buscador: ParametroModelo = new ParametroModelo();
  buscadorForm: FormGroup;
  cargando = false;  

  constructor( private parametrosService: ParametrosService,
    private comunes: ComunesService,
    public router: Router,
    private fb: FormBuilder ) {     
  }

  ngOnInit() {    
    this.crearFormulario();
    this.crearTabla();
  }

  buscadorParametros(event) {
    event.preventDefault();
    this.cargando = true;
    this.parametros = [];
    this.rerender();
    this.buscador = this.buscadorForm.getRawValue();
    this.parametrosService.buscarParametrosFiltrosTabla(this.buscador)
    .subscribe( resp => {      
      this.parametros = resp;
      this.dtTrigger.next();
      this.cargando = false;
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: e.status +'. '+ this.comunes.obtenerError(e),
      })
      this.cargando = false;
      this.dtTrigger.next();
    });
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
        {data:'parametroId'}, {data:'codigoParametro'}, {data:'descripcion'},
        //{data:'nombre'}, 
        {data:'valor'}, {data:'descripcionValor'},
        {data:'estado'},
        {data:'Editar'},
        {data:'Borrar'},
      ],
      dom: 'lBfrtip',
      buttons: [
        {
          extend:    'copy',
          text:      '<i class="far fa-copy"></i>',
          titleAttr: 'Copiar',
          className: 'btn btn-light',
          title:     'Listado de parametros',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7]
          },
        },
        {
          extend:    'csv',
          title:     'Listado de parametros',
          text:      '<i class="fas fa-file-csv"></i>',
          titleAttr: 'Exportar a CSV',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7]
          },
        },
        {
          extend:    'excelHtml5',
          title:     'Listado de parametros',
          text:      '<i class="fas fa-file-excel"></i> ',
          titleAttr: 'Exportar a Excel',
          className: 'btn btn-light',
          autoFilter: true,
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7]
          }
        },          
        {
          extend:    'print',
          title:     'Listado de parametros',
          text:      '<i class="fa fa-print"></i> ',
          titleAttr: 'Imprimir',
          className: 'btn btn-light',
          messageTop: 'Usuario:  <br>Fecha: '+ new Date().toLocaleString(),
          exportOptions: {
            columns: [ 0, 1, 2, 3, 4, 5, 6, 7]
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

  limpiar(event) {
    event.preventDefault();
    this.buscadorForm.reset();
    this.buscador = new ParametroModelo();
    this.parametros = [];
    this.rerender();
    this.dtTrigger.next();
  }

  editar(event, id: number) {
    event.preventDefault();
    this.router.navigate(['parametro', id]);
  }

  borrarParametro(event, parametro: ParametroModelo ) {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea borrar a ${ parametro.codigoParametro }`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {
        let peticion: Observable<any>;
        peticion = this.parametrosService.borrarParametro( parametro.parametroId );

        peticion.subscribe( resp => {
          Swal.fire({
                    icon: 'success',
                    title: parametro.codigoParametro,
                    text: resp.mensaje,
                  }).then( resp => {
            if ( resp.value ) {
              this.buscadorParametros(event);
            }
          });
        }, e => {              
            Swal.fire({
              icon: 'info',
              title: 'Algo salió mal',
              text: e.status +'. '+ this.comunes.obtenerError(e),
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
      parametroId  : ['', [] ],
      codigoParametro  : ['', [] ],
      descripcion  : ['', [] ],
      valor: ['', [] ],
      descripcionValor: ['', [] ],
      estado:  [null, [] ]
    });
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
