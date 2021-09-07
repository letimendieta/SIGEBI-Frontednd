import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { InsumosMedicosService } from '../../../servicios/insumosMedicos.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../../common/global-constants';
import { ComunesService } from 'src/app/servicios/comunes.service';
import { DataTableDirective } from 'angular-datatables';
import { InsumoMedicoModelo } from 'src/app/modelos/insumoMedico.modelo';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/servicios/token.service';

@Component({
  selector: 'app-insumos',
  templateUrl: './insumos.component.html',
  styleUrls: ['./insumos.component.css']
})
export class InsumosComponent implements OnInit {
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  dtOptionsInsumos: any = {};
  buttons: any = {};
  dtTriggerInsumos : Subject<any> = new Subject<any>();

  insumos: InsumoMedicoModelo[] = [];
  buscador: InsumoMedicoModelo = new InsumoMedicoModelo();
  buscadorForm: FormGroup;
  cargando = false;  

  constructor( private tokenService: TokenService,
               private insumosMedicosService: InsumosMedicosService,
               private comunes: ComunesService,
               public router: Router,
               private fb: FormBuilder) {    
  }

  ngOnInit() {    
    this.crearFormulario();
    var rolesUsuario = this.comunes.obtenerRoles(); 
    if(rolesUsuario.includes(GlobalConstants.ROL_REPORTE_LISTADOS)
      || rolesUsuario.includes(GlobalConstants.ROL_ADMIN)){
        this.initButtonsReports();
    }else {
      this.buttons = [];
    }    
    this.crearTabla();
  }

  crearTabla(){
    this.dtOptionsInsumos = {
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
        {data:'#'}, {data:'insumoMedicoId'},
        {data:'codigo'}, {data:'nombre'}, {data:'caracteristicas'},
        {data:'presentacion'}, {data:'unidadMedida'},
        {data:'Editar'},
        {data:'Borrar'}
      ],
      dom: 'lBfrtip',
      buttons: this.buttons
    };
  }

  buscadorInsumos(event) {
    event.preventDefault();
    this.cargando = true;
    this.insumos = [];
    this.rerender();
    var buscador: InsumoMedicoModelo = new InsumoMedicoModelo();
    buscador = this.buscadorForm.getRawValue();
    var orderBy = "insumoMedicoId";
    var orderDir = "desc";
    this.insumosMedicosService.buscarInsumosMedicosFiltros(buscador, orderBy, orderDir)
    .subscribe( resp => {      
      this.insumos = resp;
      this.dtTriggerInsumos.next();
      this.cargando = false;
    }, e => {
      Swal.fire({
        icon: 'info',
        title: 'Algo salió mal',
        text: this.comunes.obtenerError(e)
      })
      this.cargando = false;
      this.dtTriggerInsumos.next();
    });
  }

  limpiar(event) {
    event.preventDefault();
    this.buscadorForm.reset();
    this.insumos = [];
    this.rerender();
    this.dtTriggerInsumos.next();
  }

  editar(event, id: number) {
    event.preventDefault();
    this.router.navigate(['inicio/insumo', id]);
  }

  borrarInsumo(event, insumo: InsumoMedicoModelo ) {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea borrar ${ insumo.codigo }`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {
        let peticion: Observable<any>;
        peticion = this.insumosMedicosService.borrarInsumo( insumo.insumoMedicoId );

        peticion.subscribe( resp => {
          Swal.fire({
                    icon: 'success',
                    title: insumo.codigo,
                    text: resp.mensaje,
                  }).then( resp => {
            if ( resp.value ) {
              this.buscadorInsumos(event);
            }
          });
        }, e => {            
            Swal.fire({
              icon: 'info',
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
      insumoMedicoId  : [null, [] ],
      codigo  : [null, [] ],
      nombre  : [null, [] ],
      caracteristicas : [null, [] ]
    });
  }

  ngAfterViewInit(): void {
    this.dtTriggerInsumos.next();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTriggerInsumos.unsubscribe();
  }

  initButtonsReports(){
    this.buttons = [
      {
        extend:    'copy',
        text:      '<i class="far fa-copy"></i>',
        titleAttr: 'Copiar',
        className: 'btn btn-light',
        title:     'Listado de insumos',
        messageTop: 'Usuario: ' + this.tokenService.getUserName().toString() + ' Fecha: '+ new Date().toLocaleString(),
        exportOptions: {
          columns: [ 0, 1, 2, 3, 4, 5, 6]
        },
      },
      {
        extend:    'csv',
        title:     'Listado de insumos',
        text:      '<i class="fas fa-file-csv"></i>',
        titleAttr: 'Exportar a CSV',
        className: 'btn btn-light',
        messageTop: 'Usuario: ' + this.tokenService.getUserName().toString() + ' Fecha: '+ new Date().toLocaleString(),
        exportOptions: {
          columns: [ 0, 1, 2, 3, 4, 5, 6]
        },
      },
      {
        extend:    'excelHtml5',
        title:     'Listado de insumos',
        text:      '<i class="fas fa-file-excel"></i> ',
        titleAttr: 'Exportar a Excel',
        className: 'btn btn-light',
        autoFilter: true,
        messageTop: 'Usuario: ' + this.tokenService.getUserName().toString() + ' Fecha: '+ new Date().toLocaleString(),
        exportOptions: {
          columns: [ 0, 1, 2, 3, 4, 5, 6]
        }
      },          
      {
        extend:    'print',
        title:     'Listado de insumos',
        text:      '<i class="fa fa-print"></i> ',
        titleAttr: 'Imprimir',
        className: 'btn btn-light',
        messageTop: 'Usuario: ' + this.tokenService.getUserName().toString() + ' Fecha: '+ new Date().toLocaleString(),
        exportOptions: {
          columns: [ 0, 1, 2, 3, 4, 5, 6]
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
  }
}
