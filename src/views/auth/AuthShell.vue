<script setup>
const copyrightYear = new Date().getFullYear()

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
})
</script>

<template>
  <div class="auth-page">
    <section class="auth-visual">
      <div class="auth-grid"></div>
      <div class="visual-content">
        <div class="visual-brand">
          <div class="brand-mark large"><span></span><span></span><span></span></div>
          <span class="visual-brand-copy">
            <strong>源多艺</strong>
            <small>智慧企业运营管理平台</small>
          </span>
        </div>
        <div class="visual-heading">
          <small>SMART ENTERPRISE OPERATIONS</small>
          <h1>让经营信息更清晰<br />让组织协作更高效</h1>
          <p>统一连接经营目标、客户销售、项目交付、财务运营与组织协同。</p>
        </div>
        <div class="visual-metrics">
          <div><strong>统一视图</strong><span>关键经营数据集中呈现</span></div>
          <div><strong>协同闭环</strong><span>业务流程跨部门联动</span></div>
          <div><strong>风险可控</strong><span>关键事项及时预警</span></div>
        </div>
      </div>
    </section>
    <section class="auth-panel">
      <div class="auth-card">
        <div class="mobile-brand">源多艺 · 智慧企业运营管理平台</div>
        <header><h2>{{ title }}</h2><p>{{ subtitle }}</p></header>
        <slot />
      </div>
      <footer>© {{ copyrightYear }} 福建源多艺科技集团有限公司 版权所有</footer>
    </section>
  </div>
</template>
