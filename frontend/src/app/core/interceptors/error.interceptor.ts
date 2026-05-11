import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

const HTTP_MESSAGES: Record<number, string> = {
  400: 'Dados inválidos. Verifique os campos e tente novamente.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  422: 'Operação não permitida. Verifique as regras de negócio.',
  500: 'Erro interno do servidor. Tente novamente em instantes.',
  503: 'Serviço temporariamente indisponível.',
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notif  = inject(NotificationService);
  const auth   = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Mensagem do backend tem prioridade (campo message ou error)
      const backendMsg: string | undefined =
        error.error?.message ?? error.error?.error;

      const msg = backendMsg || HTTP_MESSAGES[error.status] || 'Erro inesperado. Tente novamente.';

      notif.error(msg);

      if (error.status === 401) {
        auth.logout();
        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};
