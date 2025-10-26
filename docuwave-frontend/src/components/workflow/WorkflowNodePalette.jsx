import React from 'react';
import { Plus } from 'lucide-react';

const nodeTypes = [
  { id: 'form', label: { ar: 'نموذج', en: 'Form', fr: 'Formulaire' }, icon: '📝', color: 'bg-purple-500', description: { ar: 'تعبئة نموذج', en: 'Fill form', fr: 'Formulaire' } },
  { id: 'approval', label: { ar: 'موافقة', en: 'Approval', fr: 'Approbation' }, icon: '✓', color: 'bg-yellow-500', description: { ar: 'موافقة شخص', en: 'Person approval', fr: 'Approbation' } },
  { id: 'parallel', label: { ar: 'موافقات متوازية', en: 'Parallel', fr: 'Parallèle' }, icon: '⫸', color: 'bg-indigo-500', description: { ar: 'موافقات متعددة', en: 'Multiple approvals', fr: 'Multiples' } },
  { id: 'conditional', label: { ar: 'شرط', en: 'Conditional', fr: 'Condition' }, icon: '◊', color: 'bg-orange-500', description: { ar: 'تفرع شرطي', en: 'Conditional branch', fr: 'Branche' } },
  { id: 'adhoc', label: { ar: 'توجيه مرن', en: 'Ad-hoc', fr: 'Ad-hoc' }, icon: '⟲', color: 'bg-gray-500', description: { ar: 'توجيه ديناميكي', en: 'Dynamic routing', fr: 'Dynamique' } },
  { id: 'email', label: { ar: 'بريد', en: 'Email', fr: 'Email' }, icon: '✉', color: 'bg-blue-500', description: { ar: 'إرسال بريد', en: 'Send email', fr: 'Envoyer' } }
];

function WorkflowNodePalette({ onAddNode, language, getText }) {
  return (
    <div className="w-64 bg-white border-r p-4 overflow-y-auto">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Plus className="w-5 h-5" />
        {getText({ ar: 'العقد المتاحة', en: 'Available Nodes', fr: 'Nœuds' })}
      </h3>
      <div className="space-y-2">
        {nodeTypes.map(nt => (
          <button
            key={nt.id}
            onClick={() => onAddNode(nt.id, nodeTypes)}
            className={`w-full ${nt.color} text-white p-3 rounded hover:opacity-90`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{nt.icon}</span>
              <span className="text-sm font-medium">{getText(nt.label)}</span>
            </div>
            <p className="text-xs opacity-90">{getText(nt.description)}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-800">
        <strong>💡 {getText({ ar: 'نصائح:', en: 'Tips:', fr: 'Astuces:' })}</strong>
        <ul className="mt-2 space-y-1">
          <li>• {getText({ ar: 'اضغط الزر الأخضر للربط', en: 'Click green button to connect', fr: 'Bouton vert pour connecter' })}</li>
          <li>• {getText({ ar: 'اضغط X الأحمر لحذف الاتصال', en: 'Click red X to delete connection', fr: 'X rouge pour supprimer' })}</li>
        </ul>
      </div>
    </div>
  );
}

export default WorkflowNodePalette;