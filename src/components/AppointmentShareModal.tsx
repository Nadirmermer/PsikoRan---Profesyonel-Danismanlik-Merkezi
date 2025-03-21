import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Copy, Check, X, Share2, Mail, Phone } from 'react-feather';

interface AppointmentShareModalProps {
  show: boolean;
  onHide: () => void;
  appointmentInfo: {
    id: string;
    client: {
      full_name: string;
      email?: string;
    };
    professional: {
      full_name: string;
      title?: string;
    };
    start_time: string;
    meeting_url: string;
  };
}

export default function AppointmentShareModal({ show, onHide, appointmentInfo }: AppointmentShareModalProps) {
  const [copied, setCopied] = useState(false);

  // Format date to human readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time to human readable format
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWhatsAppMessage = () => {
    const professionalTitle = appointmentInfo.professional.title
      ? `${appointmentInfo.professional.title} `
      : '';
    
    const message = `Merhaba ${appointmentInfo.client.full_name},\n\n`
      + `${professionalTitle}${appointmentInfo.professional.full_name} ile `
      + `${formatDate(appointmentInfo.start_time)} tarihinde saat ${formatTime(appointmentInfo.start_time)} için `
      + `planlanmış çevrimiçi görüşmenize aşağıdaki bağlantıdan katılabilirsiniz:\n\n`
      + `${appointmentInfo.meeting_url}\n\n`
      + `İyi günler dileriz.`;
    
    return encodeURIComponent(message);
  };

  const getEmailMessage = () => {
    const professionalTitle = appointmentInfo.professional.title
      ? `${appointmentInfo.professional.title} `
      : '';
    
    const subject = `Çevrimiçi Görüşme Daveti - ${formatDate(appointmentInfo.start_time)}`;
    
    const body = `Merhaba ${appointmentInfo.client.full_name},\n\n`
      + `${professionalTitle}${appointmentInfo.professional.full_name} ile `
      + `${formatDate(appointmentInfo.start_time)} tarihinde saat ${formatTime(appointmentInfo.start_time)} için `
      + `planlanmış çevrimiçi görüşmenize aşağıdaki bağlantıdan katılabilirsiniz:\n\n`
      + `${appointmentInfo.meeting_url}\n\n`
      + `Görüşme zamanında tarayıcınızdan bu bağlantıyı açarak görüşmeye katılabilirsiniz. `
      + `Herhangi bir uygulama kurmanıza gerek yoktur.\n\n`
      + `İyi günler dileriz.`;
    
    return {
      subject: encodeURIComponent(subject),
      body: encodeURIComponent(body)
    };
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appointmentInfo.meeting_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${getWhatsAppMessage()}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const emailData = getEmailMessage();
    const url = `mailto:${appointmentInfo.client.email || ''}?subject=${emailData.subject}&body=${emailData.body}`;
    window.open(url, '_blank');
  };

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onHide}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center"
                  >
                    <Share2 className="w-5 h-5 mr-2 text-purple-500" />
                    Görüşme Bağlantısını Paylaş
                  </Dialog.Title>
                  <button
                    type="button"
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={onHide}
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Aşağıdaki bağlantıyı danışanınızla paylaşarak görüşmeye davet edebilirsiniz:
                  </p>
                  
                  <div className="flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex-1 text-sm text-gray-900 dark:text-gray-100 truncate px-2">
                      {appointmentInfo.meeting_url}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="flex-shrink-0 ml-2 p-1.5 rounded-md bg-purple-100 dark:bg-purple-700 hover:bg-purple-200 dark:hover:bg-purple-600 transition-colors"
                      title="Kopyala"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                      ) : (
                        <Copy className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">
                      Bağlantı panoya kopyalandı!
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Görüşme Detayları
                  </h4>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div><span className="font-medium">Danışan:</span> {appointmentInfo.client.full_name}</div>
                    <div><span className="font-medium">Tarih:</span> {formatDate(appointmentInfo.start_time)}</div>
                    <div><span className="font-medium">Saat:</span> {formatTime(appointmentInfo.start_time)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paylaşım Seçenekleri
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={shareViaWhatsApp}
                      className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      WhatsApp ile Gönder
                    </button>
                    
                    <button
                      type="button"
                      onClick={shareViaEmail}
                      className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      E-posta ile Gönder
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 