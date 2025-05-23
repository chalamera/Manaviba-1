import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-[#3366CC] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>トップページに戻る</span>
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">利用規約</h1>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. はじめに</h2>
              <p className="text-gray-600 mb-4">
                「Manaviba」（以下「本サービス」）は、大学生向けに講義ノートや過去問を売買できるマーケットプレイスです。本サービスをご利用いただくにあたり、以下の利用規約（以下「本規約」）に同意いただく必要があります。本サービスを利用することにより、ユーザーは本規約に同意したものとみなされます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. 利用資格</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>本サービスは、18歳以上の大学生または教育機関に在籍する学生を対象としています。</li>
                <li>アカウント登録の際には、正確かつ最新の情報を提供していただく必要があります。</li>
                <li>他者のアカウントの無断使用、なりすまし行為は禁止されています。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">3. アカウント管理</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>ユーザーは自身のアカウント情報（パスワードを含む）の機密性を維持する責任があります。</li>
                <li>アカウントの不正使用や不審な活動に気づいた場合は、直ちに本サービス運営者に報告してください。</li>
                <li>長期間利用されていないアカウントは、事前通知の上で削除される場合があります。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">4. コンテンツの共有と責任</h2>
              <div className="text-gray-600 space-y-4">
                <p>当プラットフォームは学生同士の知識共有を目的としており、ユーザーの積極的な資料提供を歓迎します。</p>
                <p>投稿者は自身の学習経験や知識をもとに作成した資料を共有することで、他の学生の学習をサポートし、学習コミュニティの発展に貢献できます。</p>
                <p>本プラットフォームは、ユーザー間の学習資料の共有を促進する場を提供するのみであり、投稿されるコンテンツについて一切の責任を負いません。</p>
                <p>本サービスを利用して投稿・共有されるすべてのコンテンツについては、投稿者が単独で全責任を負うものとします。</p>
                <p>投稿された資料の内容については基本的に投稿者の裁量に委ねられますが、投稿者は自身が投稿するコンテンツに関連して発生するあらゆる問題（著作権侵害、適法性、正確性等に関する問題を含む）について、完全に自己責任で対応するものとします。</p>
                <p>投稿されたコンテンツに対する苦情や紛争が生じた場合、プラットフォームは仲介や解決のための介入を行う義務を負わず、当事者間での解決を求めます。</p>
                <p>本サービスは投稿コンテンツの審査や監視を行う義務を負わず、違法または不適切なコンテンツの検出や削除について保証するものではありません。</p>
                <p>明らかに不適切と判断されるコンテンツについては、コミュニティガイドラインに基づき対応させていただく場合がありますが、これは本サービスの義務ではなく裁量によるものです。</p>
                <p>本サービスを通じて共有・取得した情報の使用によって生じるいかなる損害についても、プラットフォーム運営者は一切の責任を負いません。</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">5. 禁止事項</h2>
              <p className="text-gray-600 mb-2">以下の行為は禁止されています：</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>虚偽または誤解を招く情報の投稿</li>
                <li>他のユーザーへの嫌がらせやいじめ</li>
                <li>わいせつな内容や差別的内容を含むコンテンツの投稿</li>
                <li>本サービスのセキュリティを侵害する行為</li>
                <li>本サービスの機能を妨害する行為</li>
                <li>他者の個人情報の無断収集や公開</li>
                <li>商業的スパムやマルウェアの配布</li>
                <li>試験中のカンニングや学術的不正行為を助長するコンテンツの投稿</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">6. コンテンツの販売と購入</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>販売者は、コンテンツの正確な説明、品質、価格を提供する責任があります。</li>
                <li>購入者は、購入前にコンテンツのプレビューを確認することを推奨します。</li>
                <li>一度購入されたデジタルコンテンツの返金は、特定の条件（コンテンツの重大な欠陥など）を除き、原則として行われません。</li>
                <li>価格設定は販売者の裁量に委ねられますが、過度に高額な価格設定や価格操作行為は禁止されています。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">7. 支払いと手数料</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>本サービスでは、Stripeを通じて安全な決済処理を行います。</li>
                <li>販売者が受け取る金額は、販売価格から本サービスの手数料（販売価格の15%）を差し引いた金額となります。</li>
                <li>支払い処理に関する手数料は、適用される法律に従って変更される場合があります。</li>
                <li>支払いに関するトラブルは、まず当事者間で解決を試みてください。解決できない場合は本サービス運営者に連絡してください。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">8. プライバシーポリシー</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>本サービスは、ユーザーの個人情報を当社のプライバシーポリシーに従って収集、使用、保護します。</li>
                <li>ユーザーは本サービスを利用することで、プライバシーポリシーにも同意したものとみなされます。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">9. 知的財産権</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>本サービス上で販売者が共有するコンテンツの知的財産権は、引き続き販売者に帰属します。</li>
                <li>購入者は、購入したコンテンツを個人的な学習目的でのみ使用することができ、再販売や再配布は禁止されています。</li>
                <li>本サービスのロゴ、デザイン、ソフトウェアなどの知的財産権は、本サービス運営者に帰属します。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">10. サービスの変更と終了</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>本サービス運営者は、事前通知なしにサービスの一部または全部を変更、停止、終了する権利を有します。</li>
                <li>サービスの変更または終了により生じる損害について、本サービス運営者は責任を負いません。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">11. 免責事項</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>本サービスは「現状有姿」で提供され、特定の目的への適合性や商品性を含む、明示的または黙示的な保証はありません。</li>
                <li>本サービス運営者は、ユーザー間の取引やコンテンツの品質に関して責任を負いません。</li>
                <li>本サービスの利用により生じた損害について、本サービス運営者は法律で認められる最大限の範囲で責任を負いません。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">12. 紛争解決</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>本規約に関連する紛争は、まず当事者間の話し合いにより解決を試みるものとします。</li>
                <li>話し合いで解決できない場合は、日本国の法律に従い、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">13. 規約の変更</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>本サービス運営者は、必要に応じて本規約を変更する権利を有します。</li>
                <li>規約の変更は、本サービス上での告知または登録メールアドレスへの通知により行われ、通知後も継続して本サービスを利用する場合、変更後の規約に同意したものとみなされます。</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;