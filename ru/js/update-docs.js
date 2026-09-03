// update-docs.js - Уведомление об обновлении документов
// https://kirill12633.github.io/Metro.New.Official/ru/js/update-docs.js

(function() {
    'use strict';

    // ========== ОПРЕДЕЛЕНИЕ СРЕДЫ ==========
    const isProduction = window.location.hostname !== 'localhost' &&
                        !window.location.hostname.includes('127.0.0.1') &&
                        !window.location.hostname.includes('github.io');

    // ========== ЛОГГЕР ==========
    const logger = {
        log: function() {
            if (!isProduction) console.log.apply(console, arguments);
        },
        warn: function() {
            if (!isProduction) console.warn.apply(console, arguments);
        },
        error: function() {
            if (!isProduction) console.error.apply(console, arguments);
        }
    };

    logger.log('📄 update-docs.js загружен');

    // ========== КОНФИГУРАЦИЯ ==========
    const STORAGE_PREFIX = 'metro_doc_';
    const DEFAULT_LANG = 'ru';

    // ★ ПРИ ОБНОВЛЕНИИ ДОКУМЕНТА - МЕНЯЙТЕ version ★
    const DOCS = {
        privacy: {
            version: '1.5.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/privacy-policy/',
            icon: '🔒',
            lastUpdate: '06 июня 2026 года'
        },
        terms: {
            version: '1.1.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/terms-of-service/',
            icon: '📝',
            lastUpdate: '06 апреля 2026 года'
        },
        site: {
            version: '1.0.0',
            url: 'https://kirill12633.github.io/Metro.New.Official/ru/help/site-guidelines/',
            icon: '🌐',
            lastUpdate: '06 апреля 2026 года'
        }
    };

    // ========== ЛОКАЛИЗАЦИЯ (10 ЯЗЫКОВ) ==========
    const I18N = {
        ru: {
            title: '📢 Обновление документов',
            subtitle: 'Нажмите на документ, чтобы прочитать',
            acceptBtn: '✅ Я ознакомился и принимаю',
            hint: 'Нажимая «Принять», вы подтверждаете, что прочитали документы',
            updatedLabel: 'Обновлено',
            fromLabel: 'от',
            closeBtn: '✕ Закрыть',
            laterBtn: '⏰ Напомнить позже',
            whatChanged: 'Что изменилось?',
            changesList: 'Список изменений:',
            acceptAll: 'Принять все',
            declineAll: 'Отклонить все',
            selectAll: 'Выбрать все',
            selected: 'выбрано',
            of: 'из',
            documents: 'документов',
            loading: 'Загрузка...',
            error: 'Ошибка загрузки',
            retry: 'Повторить',
            mandatory: 'Обязательно к прочтению',
            optional: 'Рекомендуется к прочтению',
            versionLabel: 'Версия',
            lastUpdateLabel: 'Последнее обновление',
            acceptedLabel: 'Принято',
            notAcceptedLabel: 'Не принято',
            confirmAccept: 'Вы уверены, что прочитали все документы?',
            confirmDecline: 'Вы уверены, что хотите отклонить обновления?',
            willShowAgain: 'Документы будут показаны снова при следующем визите',
            thankYou: 'Спасибо! Документы приняты',
            dismiss: 'Отклонить',
            readMore: 'Читать далее',
            updateAvailable: 'Доступно обновление',
            newVersion: 'Новая версия',
            oldVersion: 'Старая версия',
            compareVersions: 'Сравнить версии',
            changelog: 'История изменений',
            dateAccepted: 'Дата принятия',
            neverAccepted: 'Ещё не принято',
            languageLabel: 'Язык',
            chooseLanguage: 'Выберите язык',
            autoDetect: 'Автоопределение',
            saveLanguage: 'Сохранить язык',
            languageSaved: 'Язык сохранён',
            documentsUpdated: 'Документы обновлены',
            documentsNeedAttention: 'Документы требуют внимания',
            allDocumentsAccepted: 'Все документы приняты',
            someDocumentsPending: 'Некоторые документы не приняты',
            noUpdates: 'Обновлений нет',
            checkAgain: 'Проверить снова',
            lastCheck: 'Последняя проверка',
            never: 'Никогда',
            today: 'Сегодня',
            yesterday: 'Вчера',
            daysAgo: 'дней назад'
        },
        en: {
            title: '📢 Documents Update',
            subtitle: 'Click on a document to read it',
            acceptBtn: '✅ I have read and accept',
            hint: 'By clicking "Accept", you confirm that you have read the documents',
            updatedLabel: 'Updated',
            fromLabel: 'from',
            closeBtn: '✕ Close',
            laterBtn: '⏰ Remind later',
            whatChanged: 'What changed?',
            changesList: 'List of changes:',
            acceptAll: 'Accept all',
            declineAll: 'Decline all',
            selectAll: 'Select all',
            selected: 'selected',
            of: 'of',
            documents: 'documents',
            loading: 'Loading...',
            error: 'Loading error',
            retry: 'Retry',
            mandatory: 'Mandatory reading',
            optional: 'Recommended reading',
            versionLabel: 'Version',
            lastUpdateLabel: 'Last update',
            acceptedLabel: 'Accepted',
            notAcceptedLabel: 'Not accepted',
            confirmAccept: 'Are you sure you have read all documents?',
            confirmDecline: 'Are you sure you want to decline updates?',
            willShowAgain: 'Documents will be shown again on your next visit',
            thankYou: 'Thank you! Documents accepted',
            dismiss: 'Dismiss',
            readMore: 'Read more',
            updateAvailable: 'Update available',
            newVersion: 'New version',
            oldVersion: 'Old version',
            compareVersions: 'Compare versions',
            changelog: 'Changelog',
            dateAccepted: 'Date accepted',
            neverAccepted: 'Not accepted yet',
            languageLabel: 'Language',
            chooseLanguage: 'Choose language',
            autoDetect: 'Auto-detect',
            saveLanguage: 'Save language',
            languageSaved: 'Language saved',
            documentsUpdated: 'Documents updated',
            documentsNeedAttention: 'Documents need attention',
            allDocumentsAccepted: 'All documents accepted',
            someDocumentsPending: 'Some documents are pending',
            noUpdates: 'No updates',
            checkAgain: 'Check again',
            lastCheck: 'Last check',
            never: 'Never',
            today: 'Today',
            yesterday: 'Yesterday',
            daysAgo: 'days ago'
        },
        de: {
            title: '📢 Dokumenten-Update',
            subtitle: 'Klicken Sie auf ein Dokument, um es zu lesen',
            acceptBtn: '✅ Ich habe gelesen und akzeptiere',
            hint: 'Mit dem Klick auf "Akzeptieren" bestätigen Sie, dass Sie die Dokumente gelesen haben',
            updatedLabel: 'Aktualisiert',
            fromLabel: 'vom',
            closeBtn: '✕ Schließen',
            laterBtn: '⏰ Später erinnern',
            whatChanged: 'Was hat sich geändert?',
            changesList: 'Liste der Änderungen:',
            acceptAll: 'Alle akzeptieren',
            declineAll: 'Alle ablehnen',
            selectAll: 'Alle auswählen',
            selected: 'ausgewählt',
            of: 'von',
            documents: 'Dokumente',
            loading: 'Laden...',
            error: 'Ladefehler',
            retry: 'Wiederholen',
            mandatory: 'Pflichtlektüre',
            optional: 'Empfohlene Lektüre',
            versionLabel: 'Version',
            lastUpdateLabel: 'Letzte Aktualisierung',
            acceptedLabel: 'Akzeptiert',
            notAcceptedLabel: 'Nicht akzeptiert',
            confirmAccept: 'Sind Sie sicher, dass Sie alle Dokumente gelesen haben?',
            confirmDecline: 'Möchten Sie die Updates wirklich ablehnen?',
            willShowAgain: 'Dokumente werden bei Ihrem nächsten Besuch erneut angezeigt',
            thankYou: 'Danke! Dokumente akzeptiert',
            dismiss: 'Ablehnen',
            readMore: 'Weiterlesen',
            updateAvailable: 'Update verfügbar',
            newVersion: 'Neue Version',
            oldVersion: 'Alte Version',
            compareVersions: 'Versionen vergleichen',
            changelog: 'Änderungsprotokoll',
            dateAccepted: 'Akzeptiert am',
            neverAccepted: 'Noch nicht akzeptiert',
            languageLabel: 'Sprache',
            chooseLanguage: 'Sprache wählen',
            autoDetect: 'Automatisch erkennen',
            saveLanguage: 'Sprache speichern',
            languageSaved: 'Sprache gespeichert',
            documentsUpdated: 'Dokumente aktualisiert',
            documentsNeedAttention: 'Dokumente benötigen Aufmerksamkeit',
            allDocumentsAccepted: 'Alle Dokumente akzeptiert',
            someDocumentsPending: 'Einige Dokumente sind ausstehend',
            noUpdates: 'Keine Updates',
            checkAgain: 'Erneut prüfen',
            lastCheck: 'Letzte Prüfung',
            never: 'Nie',
            today: 'Heute',
            yesterday: 'Gestern',
            daysAgo: 'Tage zuvor'
        },
        fr: {
            title: '📢 Mise à jour des documents',
            subtitle: 'Cliquez sur un document pour le lire',
            acceptBtn: '✅ J\'ai lu et j\'accepte',
            hint: 'En cliquant sur « Accepter », vous confirmez avoir lu les documents',
            updatedLabel: 'Mis à jour',
            fromLabel: 'du',
            closeBtn: '✕ Fermer',
            laterBtn: '⏰ Rappeler plus tard',
            whatChanged: 'Qu\'est-ce qui a changé ?',
            changesList: 'Liste des changements :',
            acceptAll: 'Tout accepter',
            declineAll: 'Tout refuser',
            selectAll: 'Tout sélectionner',
            selected: 'sélectionné',
            of: 'sur',
            documents: 'documents',
            loading: 'Chargement...',
            error: 'Erreur de chargement',
            retry: 'Réessayer',
            mandatory: 'Lecture obligatoire',
            optional: 'Lecture recommandée',
            versionLabel: 'Version',
            lastUpdateLabel: 'Dernière mise à jour',
            acceptedLabel: 'Accepté',
            notAcceptedLabel: 'Non accepté',
            confirmAccept: 'Êtes-vous sûr d\'avoir lu tous les documents ?',
            confirmDecline: 'Voulez-vous vraiment refuser les mises à jour ?',
            willShowAgain: 'Les documents seront à nouveau affichés lors de votre prochaine visite',
            thankYou: 'Merci ! Documents acceptés',
            dismiss: 'Refuser',
            readMore: 'Lire la suite',
            updateAvailable: 'Mise à jour disponible',
            newVersion: 'Nouvelle version',
            oldVersion: 'Ancienne version',
            compareVersions: 'Comparer les versions',
            changelog: 'Journal des modifications',
            dateAccepted: 'Date d\'acceptation',
            neverAccepted: 'Pas encore accepté',
            languageLabel: 'Langue',
            chooseLanguage: 'Choisir la langue',
            autoDetect: 'Détection automatique',
            saveLanguage: 'Enregistrer la langue',
            languageSaved: 'Langue enregistrée',
            documentsUpdated: 'Documents mis à jour',
            documentsNeedAttention: 'Les documents nécessitent une attention',
            allDocumentsAccepted: 'Tous les documents acceptés',
            someDocumentsPending: 'Certains documents sont en attente',
            noUpdates: 'Aucune mise à jour',
            checkAgain: 'Vérifier à nouveau',
            lastCheck: 'Dernière vérification',
            never: 'Jamais',
            today: 'Aujourd\'hui',
            yesterday: 'Hier',
            daysAgo: 'jours avant'
        },
        es: {
            title: '📢 Actualización de documentos',
            subtitle: 'Haga clic en un documento para leerlo',
            acceptBtn: '✅ He leído y acepto',
            hint: 'Al hacer clic en "Aceptar", confirma que ha leído los documentos',
            updatedLabel: 'Actualizado',
            fromLabel: 'del',
            closeBtn: '✕ Cerrar',
            laterBtn: '⏰ Recordar más tarde',
            whatChanged: '¿Qué ha cambiado?',
            changesList: 'Lista de cambios:',
            acceptAll: 'Aceptar todo',
            declineAll: 'Rechazar todo',
            selectAll: 'Seleccionar todo',
            selected: 'seleccionado',
            of: 'de',
            documents: 'documentos',
            loading: 'Cargando...',
            error: 'Error de carga',
            retry: 'Reintentar',
            mandatory: 'Lectura obligatoria',
            optional: 'Lectura recomendada',
            versionLabel: 'Versión',
            lastUpdateLabel: 'Última actualización',
            acceptedLabel: 'Aceptado',
            notAcceptedLabel: 'No aceptado',
            confirmAccept: '¿Está seguro de que ha leído todos los documentos?',
            confirmDecline: '¿Está seguro de que desea rechazar las actualizaciones?',
            willShowAgain: 'Los documentos se mostrarán nuevamente en su próxima visita',
            thankYou: '¡Gracias! Documentos aceptados',
            dismiss: 'Rechazar',
            readMore: 'Leer más',
            updateAvailable: 'Actualización disponible',
            newVersion: 'Nueva versión',
            oldVersion: 'Versión anterior',
            compareVersions: 'Comparar versiones',
            changelog: 'Registro de cambios',
            dateAccepted: 'Fecha de aceptación',
            neverAccepted: 'Aún no aceptado',
            languageLabel: 'Idioma',
            chooseLanguage: 'Elegir idioma',
            autoDetect: 'Detección automática',
            saveLanguage: 'Guardar idioma',
            languageSaved: 'Idioma guardado',
            documentsUpdated: 'Documentos actualizados',
            documentsNeedAttention: 'Los documentos necesitan atención',
            allDocumentsAccepted: 'Todos los documentos aceptados',
            someDocumentsPending: 'Algunos documentos están pendientes',
            noUpdates: 'Sin actualizaciones',
            checkAgain: 'Verificar de nuevo',
            lastCheck: 'Última verificación',
            never: 'Nunca',
            today: 'Hoy',
            yesterday: 'Ayer',
            daysAgo: 'días antes'
        },
        it: {
            title: '📢 Aggiornamento documenti',
            subtitle: 'Clicca su un documento per leggerlo',
            acceptBtn: '✅ Ho letto e accetto',
            hint: 'Cliccando su "Accetta", confermi di aver letto i documenti',
            updatedLabel: 'Aggiornato',
            fromLabel: 'del',
            closeBtn: '✕ Chiudi',
            laterBtn: '⏰ Ricorda più tardi',
            whatChanged: 'Cosa è cambiato?',
            changesList: 'Elenco delle modifiche:',
            acceptAll: 'Accetta tutto',
            declineAll: 'Rifiuta tutto',
            selectAll: 'Seleziona tutto',
            selected: 'selezionato',
            of: 'di',
            documents: 'documenti',
            loading: 'Caricamento...',
            error: 'Errore di caricamento',
            retry: 'Riprova',
            mandatory: 'Lettura obbligatoria',
            optional: 'Lettura consigliata',
            versionLabel: 'Versione',
            lastUpdateLabel: 'Ultimo aggiornamento',
            acceptedLabel: 'Accettato',
            notAcceptedLabel: 'Non accettato',
            confirmAccept: 'Sei sicuro di aver letto tutti i documenti?',
            confirmDecline: 'Sei sicuro di voler rifiutare gli aggiornamenti?',
            willShowAgain: 'I documenti verranno mostrati di nuovo alla prossima visita',
            thankYou: 'Grazie! Documenti accettati',
            dismiss: 'Rifiuta',
            readMore: 'Leggi di più',
            updateAvailable: 'Aggiornamento disponibile',
            newVersion: 'Nuova versione',
            oldVersion: 'Vecchia versione',
            compareVersions: 'Confronta versioni',
            changelog: 'Registro modifiche',
            dateAccepted: 'Data di accettazione',
            neverAccepted: 'Non ancora accettato',
            languageLabel: 'Lingua',
            chooseLanguage: 'Scegli lingua',
            autoDetect: 'Rilevamento automatico',
            saveLanguage: 'Salva lingua',
            languageSaved: 'Lingua salvata',
            documentsUpdated: 'Documenti aggiornati',
            documentsNeedAttention: 'I documenti richiedono attenzione',
            allDocumentsAccepted: 'Tutti i documenti accettati',
            someDocumentsPending: 'Alcuni documenti sono in sospeso',
            noUpdates: 'Nessun aggiornamento',
            checkAgain: 'Controlla di nuovo',
            lastCheck: 'Ultimo controllo',
            never: 'Mai',
            today: 'Oggi',
            yesterday: 'Ieri',
            daysAgo: 'giorni fa'
        },
        pt: {
            title: '📢 Atualização de documentos',
            subtitle: 'Clique em um documento para ler',
            acceptBtn: '✅ Li e aceito',
            hint: 'Ao clicar em "Aceitar", você confirma que leu os documentos',
            updatedLabel: 'Atualizado',
            fromLabel: 'de',
            closeBtn: '✕ Fechar',
            laterBtn: '⏰ Lembrar mais tarde',
            whatChanged: 'O que mudou?',
            changesList: 'Lista de mudanças:',
            acceptAll: 'Aceitar tudo',
            declineAll: 'Recusar tudo',
            selectAll: 'Selecionar tudo',
            selected: 'selecionado',
            of: 'de',
            documents: 'documentos',
            loading: 'Carregando...',
            error: 'Erro de carregamento',
            retry: 'Tentar novamente',
            mandatory: 'Leitura obrigatória',
            optional: 'Leitura recomendada',
            versionLabel: 'Versão',
            lastUpdateLabel: 'Última atualização',
            acceptedLabel: 'Aceito',
            notAcceptedLabel: 'Não aceito',
            confirmAccept: 'Tem certeza de que leu todos os documentos?',
            confirmDecline: 'Tem certeza de que deseja recusar as atualizações?',
            willShowAgain: 'Os documentos serão mostrados novamente na próxima visita',
            thankYou: 'Obrigado! Documentos aceitos',
            dismiss: 'Recusar',
            readMore: 'Ler mais',
            updateAvailable: 'Atualização disponível',
            newVersion: 'Nova versão',
            oldVersion: 'Versão antiga',
            compareVersions: 'Comparar versões',
            changelog: 'Registro de alterações',
            dateAccepted: 'Data de aceitação',
            neverAccepted: 'Ainda não aceito',
            languageLabel: 'Idioma',
            chooseLanguage: 'Escolher idioma',
            autoDetect: 'Detecção automática',
            saveLanguage: 'Salvar idioma',
            languageSaved: 'Idioma salvo',
            documentsUpdated: 'Documentos atualizados',
            documentsNeedAttention: 'Documentos precisam de atenção',
            allDocumentsAccepted: 'Todos os documentos aceitos',
            someDocumentsPending: 'Alguns documentos pendentes',
            noUpdates: 'Sem atualizações',
            checkAgain: 'Verificar novamente',
            lastCheck: 'Última verificação',
            never: 'Nunca',
            today: 'Hoje',
            yesterday: 'Ontem',
            daysAgo: 'dias atrás'
        },
        ja: {
            title: '📢 文書の更新',
            subtitle: '文書をクリックして読む',
            acceptBtn: '✅ 読了し、同意します',
            hint: '「同意する」をクリックすると、文書を読んだことを確認したことになります',
            updatedLabel: '更新済み',
            fromLabel: 'から',
            closeBtn: '✕ 閉じる',
            laterBtn: '⏰ 後で通知',
            whatChanged: '何が変わりましたか？',
            changesList: '変更点一覧：',
            acceptAll: 'すべて同意',
            declineAll: 'すべて拒否',
            selectAll: 'すべて選択',
            selected: '選択済み',
            of: '/',
            documents: '文書',
            loading: '読み込み中...',
            error: '読み込みエラー',
            retry: '再試行',
            mandatory: '必読',
            optional: '推奨',
            versionLabel: 'バージョン',
            lastUpdateLabel: '最終更新',
            acceptedLabel: '同意済み',
            notAcceptedLabel: '未同意',
            confirmAccept: 'すべての文書を読んだことを確認しますか？',
            confirmDecline: '更新を拒否してもよろしいですか？',
            willShowAgain: '次回の訪問時に文書が再度表示されます',
            thankYou: 'ありがとうございます！文書が承認されました',
            dismiss: '拒否',
            readMore: '続きを読む',
            updateAvailable: '更新が利用可能',
            newVersion: '新しいバージョン',
            oldVersion: '古いバージョン',
            compareVersions: 'バージョンを比較',
            changelog: '変更履歴',
            dateAccepted: '同意日',
            neverAccepted: 'まだ同意していません',
            languageLabel: '言語',
            chooseLanguage: '言語を選択',
            autoDetect: '自動検出',
            saveLanguage: '言語を保存',
            languageSaved: '言語が保存されました',
            documentsUpdated: '文書が更新されました',
            documentsNeedAttention: '文書に注意が必要です',
            allDocumentsAccepted: 'すべての文書が同意されました',
            someDocumentsPending: '一部の文書が保留中です',
            noUpdates: '更新はありません',
            checkAgain: '再確認',
            lastCheck: '最終確認',
            never: 'なし',
            today: '今日',
            yesterday: '昨日',
            daysAgo: '日前'
        },
        zh: {
            title: '📢 文档更新',
            subtitle: '点击文档阅读',
            acceptBtn: '✅ 我已阅读并接受',
            hint: '点击"接受"即表示您确认已阅读文档',
            updatedLabel: '已更新',
            fromLabel: '从',
            closeBtn: '✕ 关闭',
            laterBtn: '⏰ 稍后提醒',
            whatChanged: '有什么变化？',
            changesList: '变更列表：',
            acceptAll: '全部接受',
            declineAll: '全部拒绝',
            selectAll: '全选',
            selected: '已选择',
            of: '/',
            documents: '文档',
            loading: '加载中...',
            error: '加载错误',
            retry: '重试',
            mandatory: '必读',
            optional: '推荐阅读',
            versionLabel: '版本',
            lastUpdateLabel: '最后更新',
            acceptedLabel: '已接受',
            notAcceptedLabel: '未接受',
            confirmAccept: '您确定已阅读所有文档吗？',
            confirmDecline: '您确定要拒绝更新吗？',
            willShowAgain: '下次访问时将再次显示文档',
            thankYou: '谢谢！文档已接受',
            dismiss: '拒绝',
            readMore: '阅读更多',
            updateAvailable: '有可用更新',
            newVersion: '新版本',
            oldVersion: '旧版本',
            compareVersions: '比较版本',
            changelog: '更新日志',
            dateAccepted: '接受日期',
            neverAccepted: '尚未接受',
            languageLabel: '语言',
            chooseLanguage: '选择语言',
            autoDetect: '自动检测',
            saveLanguage: '保存语言',
            languageSaved: '语言已保存',
            documentsUpdated: '文档已更新',
            documentsNeedAttention: '文档需要关注',
            allDocumentsAccepted: '所有文档已接受',
            someDocumentsPending: '部分文档待处理',
            noUpdates: '无更新',
            checkAgain: '再次检查',
            lastCheck: '上次检查',
            never: '从未',
            today: '今天',
            yesterday: '昨天',
            daysAgo: '天前'
        },
        ko: {
            title: '📢 문서 업데이트',
            subtitle: '문서를 클릭하여 읽으세요',
            acceptBtn: '✅ 읽었으며 동의합니다',
            hint: '"동의"를 클릭하면 문서를 읽었음을 확인하는 것입니다',
            updatedLabel: '업데이트됨',
            fromLabel: '부터',
            closeBtn: '✕ 닫기',
            laterBtn: '⏰ 나중에 알림',
            whatChanged: '무엇이 변경되었나요?',
            changesList: '변경 사항 목록:',
            acceptAll: '모두 동의',
            declineAll: '모두 거부',
            selectAll: '모두 선택',
            selected: '선택됨',
            of: '/',
            documents: '문서',
            loading: '로딩 중...',
            error: '로딩 오류',
            retry: '다시 시도',
            mandatory: '필독',
            optional: '권장 읽기',
            versionLabel: '버전',
            lastUpdateLabel: '마지막 업데이트',
            acceptedLabel: '동의됨',
            notAcceptedLabel: '동의 안 됨',
            confirmAccept: '모든 문서를 읽으셨나요?',
            confirmDecline: '업데이트를 거부하시겠습니까?',
            willShowAgain: '다음 방문 시 문서가 다시 표시됩니다',
            thankYou: '감사합니다! 문서가 승인되었습니다',
            dismiss: '거부',
            readMore: '더 읽기',
            updateAvailable: '업데이트 가능',
            newVersion: '새 버전',
            oldVersion: '이전 버전',
            compareVersions: '버전 비교',
            changelog: '변경 로그',
            dateAccepted: '동의 날짜',
            neverAccepted: '아직 동의 안 함',
            languageLabel: '언어',
            chooseLanguage: '언어 선택',
            autoDetect: '자동 감지',
            saveLanguage: '언어 저장',
            languageSaved: '언어가 저장되었습니다',
            documentsUpdated: '문서가 업데이트되었습니다',
            documentsNeedAttention: '문서에 주의가 필요합니다',
            allDocumentsAccepted: '모든 문서가 동의되었습니다',
            someDocumentsPending: '일부 문서가 보류 중입니다',
            noUpdates: '업데이트 없음',
            checkAgain: '다시 확인',
            lastCheck: '마지막 확인',
            never: '없음',
            today: '오늘',
            yesterday: '어제',
            daysAgo: '일 전'
        }
    };

    // ========== ОПРЕДЕЛЕНИЕ ЯЗЫКА ==========
    
    /**
     * Получить язык из localStorage
     */
    function getSavedLanguage() {
        return getStorageItem(STORAGE_PREFIX + 'lang');
    }

    /**
     * Сохранить язык в localStorage
     */
    function saveLanguage(lang) {
        return setStorageItem(STORAGE_PREFIX + 'lang', lang);
    }

    /**
     * Определить язык браузера
     */
    function getBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage || DEFAULT_LANG;
        const shortLang = lang.split('-')[0].toLowerCase();
        return I18N[shortLang] ? shortLang : DEFAULT_LANG;
    }

    /**
     * Получить текущий язык
     */
    function getCurrentLanguage() {
        const saved = getSavedLanguage();
        if (saved && I18N[saved]) {
            return saved;
        }
        
        // Пытаемся определить из URL
        const urlLang = window.location.pathname.split('/')[1];
        if (urlLang && I18N[urlLang]) {
            return urlLang;
        }
        
        return getBrowserLanguage();
    }

    /**
     * Получить перевод
     */
    function t(key, lang) {
        const currentLang = lang || getCurrentLanguage();
        return I18N[currentLang]?.[key] || I18N[DEFAULT_LANG][key] || key;
    }

    // ========== ОСНОВНЫЕ ФУНКЦИИ ==========

    /**
     * Безопасное получение данных из localStorage
     */
    function getStorageItem(key) {
        try {
            return localStorage.getItem(key);
        } catch(e) {
            logger.warn('⚠️ Не удалось прочитать localStorage:', key);
            return null;
        }
    }

    /**
     * Безопасное сохранение в localStorage
     */
    function setStorageItem(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch(e) {
            logger.warn('⚠️ Не удалось сохранить в localStorage:', key);
            return false;
        }
    }

    /**
     * Получить сохранённую версию документа
     */
    function getSavedVersion(docKey) {
        return getStorageItem(STORAGE_PREFIX + docKey + '_v');
    }

    /**
     * Сохранить версию документа
     */
    function saveVersion(docKey, version) {
        return setStorageItem(STORAGE_PREFIX + docKey + '_v', version);
    }

    /**
     * Сохранить дату принятия
     */
    function saveAcceptDate(docKey) {
        return setStorageItem(STORAGE_PREFIX + docKey + '_accepted', new Date().toISOString());
    }

    /**
     * Получить дату принятия
     */
    function getAcceptDate(docKey) {
        return getStorageItem(STORAGE_PREFIX + docKey + '_accepted');
    }

    /**
     * Найти обновлённые документы
     */
    function getUpdatedDocs() {
        const updated = [];
        for (const [key, doc] of Object.entries(DOCS)) {
            const savedVersion = getSavedVersion(key);
            if (savedVersion !== doc.version) {
                updated.push({ ...doc, key });
            }
        }
        return updated;
    }

    /**
     * Принять обновления
     */
    function acceptUpdates(docs) {
        for (const doc of docs) {
            saveVersion(doc.key, doc.version);
            saveAcceptDate(doc.key);
        }
        logger.log('📄 Обновления приняты:', docs.map(d => d.name).join(', '));
    }

    /**
     * Форматировать дату
     */
    function formatDate(dateString, lang) {
        if (!dateString) return t('neverAccepted', lang);
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(lang + '-' + lang.toUpperCase());
        } catch(e) {
            return dateString;
        }
    }

    // ========== СОЗДАНИЕ МОДАЛЬНОГО ОКНА ==========

    function showModal(docs) {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => showModal(docs));
            return;
        }

        const lang = getCurrentLanguage();
        
        // Блокируем скролл
        document.body.style.overflow = 'hidden';

        // ===== СОЗДАЁМ ОВЕРЛЕЙ =====
        const overlay = document.createElement('div');
        overlay.id = 'metroUpdateModal';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(13, 21, 38, 0.95);
            z-index: 9999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            padding: 16px;
            box-sizing: border-box;
            backdrop-filter: blur(8px);
            animation: metroFadeIn 0.3s ease;
        `;

        // ===== МОДАЛЬНОЕ ОКНО =====
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(145deg, #182444, #0d1526);
            border: 1px solid rgba(255, 215, 0, 0.15);
            border-radius: 24px;
            max-width: 550px;
            width: 100%;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(0,0,0,0.8);
            animation: metroSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;

        // ===== ШАПКА =====
        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, #0066CC, #0052a3);
            padding: 24px 20px 20px;
            color: white;
            text-align: center;
            flex-shrink: 0;
            position: relative;
        `;

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255,255,255,0.3)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255,255,255,0.2)';
        });
        closeBtn.addEventListener('click', () => {
            overlay.remove();
            document.body.style.overflow = '';
        });

        // Переключатель языка
        const langSelector = document.createElement('select');
        langSelector.style.cssText = `
            position: absolute;
            top: 12px;
            left: 12px;
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 10px;
            border-radius: 20px;
            font-size: 12px;
            cursor: pointer;
            outline: none;
        `;

        const languages = {
            ru: '🇷🇺 Русский',
            en: '🇬🇧 English',
            de: '🇩🇪 Deutsch',
            fr: '🇫🇷 Français',
            es: '🇪🇸 Español',
            it: '🇮🇹 Italiano',
            pt: '🇵🇹 Português',
            ja: '🇯🇵 日本語',
            zh: '🇨🇳 中文',
            ko: '🇰🇷 한국어'
        };

        for (const [code, name] of Object.entries(languages)) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            if (code === lang) option.selected = true;
            langSelector.appendChild(option);
        }

        langSelector.addEventListener('change', function() {
            saveLanguage(this.value);
            // Перерисовываем модалку
            overlay.remove();
            document.body.style.overflow = '';
            showModal(docs);
        });

        const iconWrapper = document.createElement('div');
        iconWrapper.style.cssText = `
            width: 55px;
            height: 55px;
            background: #FFD700;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
        `;
        const icon = document.createElement('i');
        icon.className = 'fas fa-file-alt';
        icon.style.cssText = 'font-size: 26px; color: #0066CC;';
        iconWrapper.appendChild(icon);

        const title = document.createElement('h2');
        title.style.cssText = 'margin: 0; font-size: 20px; font-weight: 700;';
        title.textContent = t('title', lang);

        const subtitle = document.createElement('p');
        subtitle.style.cssText = 'margin: 6px 0 0; font-size: 13px; opacity: 0.9;';
        subtitle.textContent = t('subtitle', lang);

        header.appendChild(closeBtn);
        header.appendChild(langSelector);
        header.appendChild(iconWrapper);
        header.appendChild(title);
        header.appendChild(subtitle);

        // ===== СПИСОК ДОКУМЕНТОВ =====
        const listContainer = document.createElement('div');
        listContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            -webkit-overflow-scrolling: touch;
        `;

        const list = document.createElement('ul');
        list.style.cssText = 'list-style: none; margin: 0; padding: 0;';

        for (const doc of docs) {
            const item = document.createElement('li');
            item.style.cssText = `
                margin-bottom: 10px;
                padding: 12px 14px;
                background: rgba(255,255,255,0.04);
                border-radius: 12px;
                border-left: 3px solid #FFD700;
                transition: all 0.3s;
            `;

            const link = document.createElement('a');
            link.href = doc.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                text-decoration: none;
                color: #f2f4fa;
                cursor: pointer;
            `;

            // Иконка
            const iconSpan = document.createElement('span');
            iconSpan.style.cssText = 'font-size: 24px;';
            iconSpan.textContent = doc.icon;

            // Текст
            const textDiv = document.createElement('div');
            textDiv.style.cssText = 'flex: 1;';
            
            const nameSpan = document.createElement('div');
            nameSpan.style.cssText = 'font-weight: 600; color: #f2f4fa;';
            
            // Локализованные названия документов
            const docNames = {
                privacy: {
                    ru: 'Политика конфиденциальности',
                    en: 'Privacy Policy',
                    de: 'Datenschutzrichtlinie',
                    fr: 'Politique de confidentialité',
                    es: 'Política de privacidad',
                    it: 'Informativa sulla privacy',
                    pt: 'Política de privacidade',
                    ja: 'プライバシーポリシー',
                    zh: '隐私政策',
                    ko: '개인정보 처리방침'
                },
                terms: {
                    ru: 'Пользовательское соглашение',
                    en: 'Terms of Service',
                    de: 'Nutzungsbedingungen',
                    fr: 'Conditions d\'utilisation',
                    es: 'Términos de servicio',
                    it: 'Termini di servizio',
                    pt: 'Termos de serviço',
                    ja: '利用規約',
                    zh: '服务条款',
                    ko: '서비스 약관'
                },
                site: {
                    ru: 'Правила использования сайта',
                    en: 'Site Guidelines',
                    de: 'Website-Richtlinien',
                    fr: 'Règles du site',
                    es: 'Reglas del sitio',
                    it: 'Linee guida del sito',
                    pt: 'Diretrizes do site',
                    ja: 'サイトガイドライン',
                    zh: '网站指南',
                    ko: '사이트 가이드라인'
                }
            };
            
            nameSpan.textContent = docNames[doc.key]?.[lang] || docNames[doc.key]?.ru || doc.key;
            
            const dateSpan = document.createElement('div');
            dateSpan.style.cssText = 'font-size: 11px; color: #77819e;';
            dateSpan.textContent = t('updatedLabel', lang) + ' ' + doc.lastUpdate;

            const versionSpan = document.createElement('div');
            versionSpan.style.cssText = 'font-size: 10px; color: #FFD700; margin-top: 2px;';
            versionSpan.textContent = t('versionLabel', lang) + ': ' + doc.version;

            textDiv.appendChild(nameSpan);
            textDiv.appendChild(dateSpan);
            textDiv.appendChild(versionSpan);

            // Стрелка
            const arrow = document.createElement('span');
            arrow.style.cssText = 'color: #FFD700; font-size: 14px;';
            arrow.textContent = '📄 →';

            link.appendChild(iconSpan);
            link.appendChild(textDiv);
            link.appendChild(arrow);

            // Hover эффект
            item.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255,215,0,0.08)';
                this.style.transform = 'translateX(4px)';
            });
            item.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255,255,255,0.04)';
                this.style.transform = 'translateX(0)';
            });

            item.appendChild(link);
            list.appendChild(item);
        }

        listContainer.appendChild(list);

        // ===== ИНФОРМАЦИЯ ОБ ИЗМЕНЕНИЯХ =====
        const changesInfo = document.createElement('div');
        changesInfo.style.cssText = `
            margin: 15px 0;
            padding: 12px;
            background: rgba(255,215,0,0.05);
            border-radius: 8px;
            border: 1px solid rgba(255,215,0,0.2);
        `;
        
        const changesTitle = document.createElement('div');
        changesTitle.style.cssText = 'font-size: 13px; font-weight: 600; color: #FFD700; margin-bottom: 8px;';
        changesTitle.textContent = t('whatChanged', lang);
        
        const changesList = document.createElement('ul');
        changesList.style.cssText = 'margin: 0; padding-left: 20px; font-size: 12px; color: #f2f4fa;';
        
        // Здесь можно добавить реальные изменения
        const changes = [
            'Обновлены условия использования',
            'Добавлены новые разделы',
            'Уточнены формулировки'
        ];
        
        for (const change of changes) {
            const li = document.createElement('li');
            li.style.cssText = 'margin-bottom: 4px;';
            li.textContent = change;
            changesList.appendChild(li);
        }
        
        changesInfo.appendChild(changesTitle);
        changesInfo.appendChild(changesList);
        listContainer.appendChild(changesInfo);

        // ===== КНОПКИ ДЕЙСТВИЙ =====
        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 16px 20px;
            border-top: 1px solid rgba(37, 52, 96, 0.3);
            flex-shrink: 0;
        `;

        // Кнопка "Напомнить позже"
        const laterBtn = document.createElement('button');
        laterBtn.textContent = t('laterBtn', lang);
        laterBtn.style.cssText = `
            background: transparent;
            color: #77819e;
            border: 1px solid rgba(119, 129, 158, 0.3);
            width: 100%;
            padding: 10px;
            border-radius: 40px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.3s;
            margin-bottom: 10px;
            font-family: 'Montserrat', Arial, sans-serif;
        `;
        
        laterBtn.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(119, 129, 158, 0.1)';
        });
        
        laterBtn.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });
        
        laterBtn.addEventListener('click', function() {
            overlay.remove();
            document.body.style.overflow = '';
        });

        // Кнопка принятия
        const acceptBtn = document.createElement('button');
        acceptBtn.id = 'acceptBtn';
        acceptBtn.textContent = t('acceptBtn', lang);
        acceptBtn.style.cssText = `
            background: linear-gradient(135deg, #FFD700, #e6c200);
            color: #0d1526;
            border: none;
            width: 100%;
            padding: 14px;
            border-radius: 40px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            font-family: 'Montserrat', Arial, sans-serif;
        `;

        acceptBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(255,215,0,0.3)';
        });
        acceptBtn.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });

        acceptBtn.addEventListener('click', function() {
            if (confirm(t('confirmAccept', lang))) {
                acceptUpdates(docs);
                overlay.remove();
                document.body.style.overflow = '';
                logger.log('📄 Документы приняты');
                
                // Показываем уведомление об успехе
                showSuccessNotification(t('thankYou', lang), lang);
            }
        });

        const hint = document.createElement('p');
        hint.style.cssText = `
            font-size: 11px;
            color: #77819e;
            text-align: center;
            margin-top: 12px;
        `;
        hint.innerHTML = '<i class="fas fa-check-circle"></i> ' + t('hint', lang);

        footer.appendChild(laterBtn);
        footer.appendChild(acceptBtn);
        footer.appendChild(hint);

        // ===== СБОРКА =====
        modal.appendChild(header);
        modal.appendChild(listContainer);
        modal.appendChild(footer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // ===== ЗАКРЫТИЕ ПО ESC =====
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                const modalEl = document.getElementById('metroUpdateModal');
                if (modalEl) {
                    modalEl.remove();
                    document.body.style.overflow = '';
                    document.removeEventListener('keydown', handler);
                }
            }
        });

        // ===== ПОДКЛЮЧАЕМ FONT AWESOME =====
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const faLink = document.createElement('link');
            faLink.rel = 'stylesheet';
            faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            document.head.appendChild(faLink);
        }

        // ===== ДОБАВЛЯЕМ СТИЛИ АНИМАЦИЙ =====
        const style = document.createElement('style');
        style.textContent = `
            @keyframes metroFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes metroSlideUp {
                from {
                    opacity: 0;
                    transform: scale(0.92) translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            @keyframes metroSuccess {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

        logger.log('📄 Модальное окно обновлений показано');
    }

    /**
     * Показать уведомление об успешном принятии
     */
    function showSuccessNotification(message, lang) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 9999999;
            font-family: 'Montserrat', Arial, sans-serif;
            animation: metroSuccess 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        notification.innerHTML = '<i class="fas fa-check-circle"></i> ' + message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========

    function init() {
        const updatedDocs = getUpdatedDocs();

        if (updatedDocs.length > 0) {
            logger.log('📄 Найдены обновления документов:', updatedDocs.length);
            showModal(updatedDocs);
        } else {
            logger.log('✅ Все документы актуальны');
        }
    }

    // ========== ПУБЛИЧНЫЙ API ==========

    window.MetroUpdateDocs = {
        /**
         * Принудительно показать модальное окно (для тестирования)
         */
        forceShow: function() {
            for (const [key] of Object.entries(DOCS)) {
                localStorage.removeItem(STORAGE_PREFIX + key + '_v');
            }
            logger.log('🔄 Принудительный показ обновлений');
            window.location.reload();
        },

        /**
         * Получить версии документов
         */
        getVersions: function() {
            const versions = {};
            for (const [key, doc] of Object.entries(DOCS)) {
                versions[key] = {
                    current: doc.version,
                    saved: getSavedVersion(key),
                    name: doc.name,
                    lastUpdate: doc.lastUpdate
                };
            }
            return versions;
        },

        /**
         * Проверить наличие обновлений
         */
        checkUpdates: function() {
            return getUpdatedDocs();
        },

        /**
         * Принять все обновления программно
         */
        acceptAll: function() {
            const updated = getUpdatedDocs();
            if (updated.length > 0) {
                acceptUpdates(updated);
                logger.log('📄 Все обновления приняты программно');
                return true;
            }
            return false;
        },

        /**
         * Получить текущий язык
         */
        getLanguage: function() {
            return getCurrentLanguage();
        },

        /**
         * Установить язык
         */
        setLanguage: function(lang) {
            if (I18N[lang]) {
                saveLanguage(lang);
                logger.log('🌍 Язык установлен:', lang);
                return true;
            }
            return false;
        },

        /**
         * Получить список доступных языков
         */
        getAvailableLanguages: function() {
            return Object.keys(I18N);
        },

        /**
         * Список всех документов
         */
        docs: DOCS,

        /**
         * Конфигурация
         */
        config: {
            storagePrefix: STORAGE_PREFIX,
            isProduction: isProduction,
            defaultLanguage: DEFAULT_LANG
        }
    };

    // ========== ЗАПУСК ==========

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    logger.log('📄 MetroUpdateDocs API доступен');
    logger.log('📌 Используйте: window.MetroUpdateDocs.checkUpdates()');
})();
